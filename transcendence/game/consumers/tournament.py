import json, datetime

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync

from game.models import PongMatch, Tournament

from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

from channels.db import database_sync_to_async

from game.models import PongRoom
from channels.db import database_sync_to_async

from django.utils.crypto import get_random_string

from game.serializers import TournamentSerializer, PongMatchSerializer
import time


class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        creator = False
        self.room_group_name = None
        try:
            user = await get_user(self.scope["user"].public_username)
        except AttributeError:
            return self.close()
        except User.DoesNotExist:
            print("NO USER FOUND")
            return
        if not user.is_authenticated:
            print("USER NOT CONNECTED")
            return
        if (
            user.is_playing == True
            or user.is_in_tournament == True
            or user.is_waiting == True
        ):

            print("USER IS ALREADY IN TOURNAMENT/PLAYING")
            print(user.is_playing)
            print(user.is_in_tournament)
            print(user.is_waiting)
            await self.accept()
            await self.send(json.dumps({"status": "already_playing"}))

            return self.close()
        try:
            room_name = self.scope["url_route"]["kwargs"]["tournamentroom"]
        except KeyError:
            room_name = ""

        print(f"TOURNAMENT ID REQUESTED: {room_name}")
        if room_name == "":
            tournament = await create_tournament(user)
            print(f"CREATED TOURNAMENT NAME {tournament.name}")
            creator = True
        else:
            try:
                tournament = await get_tournament(room_name)
                print(f"JOINED TOURNAMENT NAME {tournament.name}")
                if tournament.is_running == True:
                    return await self.close()
                await add_user_tournament(tournament, user)
            except Tournament.DoesNotExist:
                await self.accept()
                await self.send(json.dumps({"status": "tournament_dont_exist"}))
                return await self.close()

        self.room_name = tournament.name
        self.room_group_name = tournament.name
        await put_user_in_tournament(user)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "tournament.message",
                "status": "new_user",
                "message": {
                    "username": user.public_username,
                    "trust_factor": user.trust_factor,
                },
            },
        )
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()
        tournament_data = await serialize_tournament(tournament)
        await self.send(
            text_data=json.dumps(
                {
                    "type": "tournament.message",
                    "status": "welcome_message",
                    "message": tournament_data,
                }
            )
        )
        if creator == True:
            await self.send(
                text_data=json.dumps(
                    {"type": "tournament.message", "status": "what_is_name"}
                )
            )

    async def disconnect(self, close_code):
        time.sleep(0.5)
        try:
            user = await get_user(self.scope["user"].public_username)
        except AttributeError:
            return
        if self.room_group_name is None:
            return
        room_name = self.room_group_name

        tournament = await remove_tournament(user)
        if tournament == None:
            try:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    ({"type": "tournament.message", "status": "admin_left"}),
                )
            except AttributeError:
                await self.channel_layer.group_send(
                    room_name, ({"type": "tournament.message", "status": "admin_left"})
                )
            await set_user_status_tournament(user, False)
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            return

        tournament_data = await serialize_tournament(tournament)
        if tournament.is_running == False:
            await self.channel_layer.group_send(
                self.room_group_name,
                (
                    {
                        "type": "tournament.message",
                        "status": "quit_waiting",
                        "message": tournament_data,
                    }
                ),
            )
        else:
            tournament = await handle_quit_tournament_running(
                self.scope["user"], tournament
            )
            tournament_data = await serialize_tournament(tournament)
            next_opponent_username = await get_username_next_opponent(
                self.scope["user"].public_username, tournament
            )
            await self.channel_layer.group_send(
                self.room_group_name,
                (
                    {
                        "type": "tournament.message",
                        "status": "disconnect_message",
                        "user": self.scope["user"].public_username,
                        "next_opponent": next_opponent_username,
                        "message": tournament_data,
                    }
                ),
            )
        if tournament.winner == None:
            await set_user_rage_quit_number(user, 1)
        await set_user_status_tournament(user, False)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):

        text_data_json = json.loads(text_data)
        try:
            status = text_data_json["status"]
        except KeyError:
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "tournament.message", "message": text_data},
            )
            return
        if status == "start":
            user = await get_user(self.scope["user"].public_username)
            tournament = await get_tournament(self.room_name)
            tournament = await start_tournament(user, tournament)

            tournament_data = await serialize_tournament(tournament)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "tournament.message",
                    "status": "start",
                    "message": tournament_data,
                },
            )
        elif status == "result":
            try:
                tournament = await get_tournament(self.room_name)
            except Tournament.DoesNotExist:
                return await self.close()
            tournament = await wrapper_save_tournament_match_result(
                tournament, text_data_json
            )
            tournament = await wrapper_Clean_up_tournament_win_lose(tournament)
            tournament_data = await serialize_tournament(tournament)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "tournament.message",
                    "status": "start",
                    "message": tournament_data,
                },
            )
        elif status == "kick":
            if check_user_is_admin(self) == False:
                return
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "tournament.message",
                    "status": "kick",
                    "message": text_data_json["username"],
                },
            )
        elif status == "set_name":
            await set_name(self.room_name, text_data_json["new_name"])

    async def tournament_message(self, event):
        await self.send(text_data=json.dumps(event))

@database_sync_to_async
def check_user_is_admin(self):
	try:
		tournament = Tournament.objects.get(name=self.room_name)
	except Tournament.DoesNotExist:
		return False
	if tournament.admin.username == self.scope["user"].username:
		return True
	return False


@database_sync_to_async
def set_name(room_name, new_name):
    try:
        tournament = Tournament.objects.get(name=room_name)
        tournament.display_name = new_name
        tournament.save()
    except Tournament.DoesNotExist:
        pass


@database_sync_to_async
def get_username_next_opponent(my_username, tournament):
    current_round = -2
    current_match = None
    for match in tournament.match.all():
        if match.Player1 != None and match.Player2 != None:
            if (
                match.Player1.public_username == my_username
                or match.Player2.public_username == my_username
            ):
                if current_round >= match.tournament_level or current_round == -2:
                    current_round = match.tournament_level
                    current_match = match

    if current_round != -2:
        return (
            current_match.Player1.public_username
            if current_match.Player1.public_username != my_username
            else current_match.Player2.public_username
        )
    else:
        return "None"


def set_user_rage_quit_number_no_async(user, weight):
    user.nb_tournament_rage_quit_admin += 1
    user.save()


@database_sync_to_async
def set_user_rage_quit_number(user, weight):
    user.nb_tournament_rage_quit += 1 * weight
    user.save()


@database_sync_to_async
def set_user_status_tournament(user, status):
    user.is_in_tournament = False
    user.is_playing = False
    user.is_waiting = False
    user.save()


def get_room_group_name(tournament):
    return tournament.name


@database_sync_to_async
def wrapper_save_tournament_match_result(tournament, text_data_json):
    match_id = text_data_json["match_id"]
    try:
        match = PongMatch.objects.get(match_id=match_id)
    except PongMatch.DoesNotExist:
        return tournament
    match.date = datetime.datetime.now().strftime("%Y%m%d%H%M")
    match.save()
    return save_tournament_match_result(
        tournament,
        {
            "match_id": match_id,
            "winner_name": match.winner_name,
            "loser_name": match.loser_name,
        },
    )


@database_sync_to_async
def wrapper_Clean_up_tournament_win_lose(tournament):
    return Clean_up_tournament_win_lose(tournament)


@database_sync_to_async
def handle_quit_tournament_running(user, tournament):
    match_player1 = tournament.match.filter(Player1=user)
    match_player2 = tournament.match.filter(Player2=user)
    username = user.public_username
    if match_player1.first() != None:
        for i in match_player1:
            if i.winner_name == "None":
                save_tournament_match_result(
                    tournament,
                    {
                        "match_id": i.match_id,
                        "loser_name": username,
                        "winner_name": i.Player2_name,
                    },
                )
                return Clean_up_tournament_win_lose(tournament)

    if match_player2.first() != None:
        for i in match_player2:
            if i.winner_name == "None":
                save_tournament_match_result(
                    tournament,
                    {
                        "match_id": i.match_id,
                        "loser_name": username,
                        "winner_name": i.Player1_name,
                    },
                )
                return Clean_up_tournament_win_lose(tournament)

    return Clean_up_tournament_win_lose(tournament)


@database_sync_to_async
def put_user_in_tournament(user):
    user.is_in_tournament = True
    user.save()


@database_sync_to_async
def remove_user_in_tournament(user):
    user.is_in_tournament = False
    user.save()


def save_tournament_match_result(tournament, data):
    match_id = data["match_id"]
    winner_name = data["winner_name"]
    loser_name = data["loser_name"]
    winner = None
    loser = None
    try:
        match = PongMatch.objects.get(match_id=match_id)
    except PongMatch.DoesNotExist:
        return tournament
    if match.winner_name == "None":
        try:
            winner = User.objects.get(public_username=data["winner_name"])
            match.Winner = winner
            match.winner_name = winner.public_username
            match.save()
        except User.DoesNotExist:
            pass

    if match.loser_name == "None":
        try:
            loser = User.objects.get(public_username=data["loser_name"])
            match.Loser = loser
            match.loser_name = loser.public_username
            match.save()

        except User.DoesNotExist:
            pass

    match.save()
    winner = match.Winner
    loser = match.Loser
    if winner != None:
        winner_name = winner.public_username
    else:
        winner_name = None

    if match.tournament_level == 1 and match.Player1 != None and match.Player2 != None:
        tournament.winner = winner
        if winner != None:
            winner.nb_tournament_won += 1
            winner.save()
        tournament.save()
        return tournament
    t_level = 1
    while 1:
        if match.tournament_level - t_level == 0:
            if match.Player1 != None and match.Player2 != None:
                tournament.winner = winner
                if winner != None:
                    winner.nb_tournament_won += 1
                    winner.save()
                tournament.save()
                return tournament
        next_match_list = tournament.match.filter(
            tournament_level=match.tournament_level - t_level
        )
        if next_match_list.first() == None:
            return tournament

        # fill next tournament match
        for i in next_match_list:
            if i.Player1_name == None:
                i.Player1_name = winner_name
                i.Player1 = winner
                i.save()
                if i.loser_name == "None":
                    return tournament
                break
            elif i.Player2_name == None:
                i.Player2_name = winner_name
                i.Player2 = winner
                i.save()
                if i.loser_name == "None":
                    return tournament
                break
        t_level += 1
    return tournament


def Clean_up_tournament_win_lose(tournament):
    """Clean up if loser name is set but not winner name"""
    match_list = tournament.match.all()
    for match in match_list:
        if match.tournament_level == 1 and match.winner_name != "None":
            tournament.winner = match.Winner
        elif (
            match.loser_name != "None"
            and match.winner_name == "None"
            and match.Player1_name is not None
            and match.Player2_name is not None
        ):

            match.Winner = (
                match.Player1 if match.Loser != match.Player1 else match.Player2
            )
            match.winner_name = match.Winner.public_username
            match.save()
        elif (
            match.loser_name is not None
            and match.winner_name == None
            and match.Player1_name is not None
            and match.Player2_name is not None
        ):
            match.Winner = (
                match.Player1 if match.Loser != match.Player1 else match.Player2
            )
            match.winner_name = match.Winner.public_username
            match.save()
    return tournament


@database_sync_to_async
def serialize_tournament(tournament):
    serialize = TournamentSerializer(tournament)
    return serialize.data


@database_sync_to_async
def is_already_in_tournament(tournament, user):
    if user in tournament.player.all():
        print("USER ALREADY IN TOURNAMENT")
        return True
    return False


@database_sync_to_async
def add_user_tournament(tournament, user):
    tournament.player.add(user)
    tournament.nb_player += 1
    tournament.save()


@database_sync_to_async
def start_tournament(user, tournament):
    print("TRYING TO START TOURNAMENT")
    print(f"USER IS {user.public_username} ADMIN is {tournament.admin}")
    if user.username != tournament.admin.username:
        print("USER IS NOT ADMIN CANCELLING START TOURNAMENT")
        return
    print("STARTING TOURNAMENT")
    tournament = setup_tournament(tournament)
    return tournament


def get_nearest_power_2(nb_user):
    power = 2
    while 1 and power < 1024:
        if power * 2 >= nb_user:
            return power
        power *= 2


def fill_match_round_extra(round_number, player_list, match_list):
    count = player_list.count()
    index_first = 0
    index_last = count - 1
    for i in match_list:
        i.Player1 = player_list[index_first]
        i.Player2 = player_list[index_last]
        player_list = player_list.exclude(pk=i.Player1.pk)
        index_last -= 1
        player_list = player_list.exclude(pk=i.Player2.pk)
        index_last = player_list.count() - 1

        i.Player1_name = i.Player1.public_username
        i.Player2_name = i.Player2.public_username
        i.save()

    return player_list


def fill_match_round_remainder(player_list, match_list):
    count = player_list.count()
    if count == 0:
        return
    for current_match in match_list:
        if player_list.count() == 0:
            break
        current_match.Player1 = player_list.first()
        current_match.Player1_name = player_list.first().public_username
        player_list = player_list.exclude(pk=current_match.Player1.pk)
        current_match.save()

    for current_match in match_list:
        if player_list.count() == 0:
            break
        current_match.Player2 = player_list.first()
        current_match.Player2_name = player_list.first().public_username
        player_list = player_list.exclude(pk=current_match.Player2.pk)
        current_match.save()


def setup_tournament(tournament):
    nb_player = tournament.nb_player
    nb_match = nb_player - 1
    nearest_power = get_nearest_power_2(nb_match)
    nb_match_pre_round = nb_match - nearest_power
    current_round = 1
    current_power = 1
    current_time = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    while nb_match > 0:
        for i in range(0, current_power):
            new_match = PongMatch.objects.create(
                match_id=get_random_string(20),
                tournament_level=current_round,
                tournament_id=tournament.name,
                tournament_match_id=i,
                date=current_time,
            )
            # if nb_match == 1:
            # 	new_match.winner_name = "willow"
            # 	new_match.loser_name = "ggay"
            # 	new_match.save()
            tournament.match.add(new_match)
            nb_match -= 1
            if nb_match == 0:
                break
        current_power = current_power * 2
        current_round += 1

    current_round -= 1
    player = tournament.player.all().order_by("-elo")
    for j in player:
        j.nb_tournament_played += 1
        j.save()
    match = tournament.match.filter(tournament_level=current_round)
    player = fill_match_round_extra(current_round, player, match)
    # print (f"FIRST PLAYER IS {player[0]}")
    print(player)
    if current_round > 0:
        match = tournament.match.filter(tournament_level=current_round - 1)
        fill_match_round_remainder(player, match)
    tournament.is_running = True
    tournament.save()
    return tournament


@database_sync_to_async
def get_user(username):
    user = User.objects.get(public_username=username)
    return user


@database_sync_to_async
def get_tournament(name):
    tournament = Tournament.objects.get(name=name)
    return tournament


def delete_unplayed_match(match_list):
    for match in match_list:
        if match.Winner == None:
            match.delete()


@database_sync_to_async
def remove_tournament(user):
    user.is_in_tournament = False
    user.is_playing = False
    user.save()
    try:
        tournament = Tournament.objects.get(admin=user)
        if tournament.winner == None:
            set_user_rage_quit_number_no_async(user, 1)
        delete_unplayed_match(tournament.match.all())
        tournament.delete()
        return
    except Tournament.DoesNotExist:
        pass
    try:
        tournament = Tournament.objects.get(player=user)
        if tournament.is_running == True:
            return tournament
        tournament.nb_player -= 1
        tournament.player.remove(user)
        tournament.save()
        return tournament

    except Tournament.DoesNotExist:
        pass


@database_sync_to_async
def create_tournament(user):
    tournament_name = get_unique_tournament_name()
    tournament = Tournament.objects.create(name=tournament_name, admin=user)
    tournament.player.add(user)
    tournament.nb_player = 1
    tournament.save()
    print(f"CREATED TOURNAMENT NB PLAYER IS {tournament.nb_player}")
    return tournament


def get_unique_tournament_name():
    # return "123456789"
    tournament_name = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    suffix = 1
    while 1:
        try:
            tournament = Tournament.objects.get(name=tournament_name)
            tournament_name = tournament_name + str(suffix)
            suffix = suffix + 1
        except Tournament.DoesNotExist:
            return tournament_name
