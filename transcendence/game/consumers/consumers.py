import json, datetime

from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync

from game.models import PongMatch

from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

from channels.db import database_sync_to_async

from game.models import PongRoom


class userConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		try:
			a = self.scope["user"].public_username
		except AttributeError:
				return self.close()
		self.room_group_name = None
		try:
			watchroom = self.scope["url_route"]["kwargs"]["watchroom"]
			self.type = "watch"
			self.room_name = watchroom
			self.room_group_name = f"pong{self.room_name}"
			await (self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
			return await self.accept()
		except:
			pass
		try:
			name = self.scope["url_route"]["kwargs"]["pongroom"]
		except KeyError:
			name = ""
		try:
			user = await get_user(self.scope["user"].public_username)
		except User.DoesNotExist:
			return await self.close()
		if user.is_authenticated == False:
			return self.close()
		if user.is_playing == True or user.is_waiting == True:
			return await self.close()
		if user.is_in_tournament == True and name == "":
			return await self.close()
		
		print(f"pong requested name:{name}")
		name = await my_connect(self, name)
		if (name == ""):
			print("CLOSING")
			return self.close()
		await set_user_waiting(user, True)
		nb_user = await getNbUser(name)
		print(nb_user)
		self.room_name = name
		self.room_group_name = f"pong{self.room_name}"
        # Join room group
		await (self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

		status = "run-game" if nb_user == 2 else "join-lobby"
		if status == "run-game":
			match = await getMatch(name)
			player1_name = match.Player1_name
			player2_name = match.Player2_name
			await set_user_playing(user , True)
		else:
			player1_name = "player1_name"
			player2_name = "player2_name"
		
		await (self.channel_layer.group_send)(
			self.room_group_name, {
				"type": "game.message",
				"status": status,
				"player_id": nb_user,
				"nb_users": nb_user,
				"player1" : player1_name,
				"player2" : player2_name,
			}
		)
		await self.accept()



	async def disconnect(self, close_code):
		user = None

		try:
			user = await get_user(self.scope["user"].public_username)
		except AttributeError:
			return
		except User.DoesNotExist:
			pass
		try:
			if self.type == "watch":
				return
		except AttributeError:
			pass		
		if 	self.room_group_name == None:
			reset_user_state(user)
			return
		await disco(self)
		try:
			await (self.channel_layer.group_send)(
				self.room_group_name, {
					"type": "game.message",
					"status": "disconnect",
					"reason": "refresh"
					}
				)
		except AttributeError:
			pass
		reset_user_state(user)
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		

	async def receive(self, text_data):
		data_dict = json.loads(text_data)
		data_dict["type"] = "game.message"
		try:
			await (self.channel_layer.group_send)(
				self.room_group_name, data_dict
			)
		except:
			pass

		text_data_json = json.loads(text_data)

		status_game = text_data_json["status"]

		if (status_game == "leave-lobby"):
			await handle_delete_match(self.room_name)
		if (status_game == "timeout"):
			await handle_delete_match(self.room_name)
		if (status_game == "goal-score"):
			await udpate_current_match_score(self.room_name, text_data_json)
		if status_game == "end-game":
			if (text_data_json["reason"] == "rage-quit" or text_data_json["reason"] == "score"):
				await match_won(self, text_data_json)
			else:
				await handle_delete_match(self.room_name)


	async def game_message(self, event):
		try:
			await self.send(text_data=json.dumps({"message": event}))
		except:
			pass



@database_sync_to_async
def reset_user_state(user):
	if user == None:
		return
	user.is_playing = False
	user.is_waiting = False
	user.save()
	
@database_sync_to_async
def udpate_current_match_score(game_id, text_data_json):
	match = PongMatch.objects.get(match_id=game_id)
	match.current_score_player_1 = text_data_json["score_player_1"]
	match.current_score_player_2 = text_data_json["score_player_2"]
	match.save()

@database_sync_to_async
def set_user_playing(user, new_val):
	user.is_playing=new_val
	user.save()

@database_sync_to_async
def set_user_waiting(user, new_val):
	user.is_waiting=new_val
	user.save()

@database_sync_to_async
def get_user(username):
	user = User.objects.get(public_username=username)
	return user

@database_sync_to_async
def getMatch(id):
	pongMatch = PongMatch.objects.get(match_id=id)
	pongMatch.is_running = True
	pongMatch.save()
	return pongMatch

@database_sync_to_async
def getNbUser(room_name):
	try:
		pong_room = PongRoom.objects.get(name=room_name)
		return pong_room.nb_user
	except PongRoom.DoesNotExist:
		return 0

@database_sync_to_async
def handle_delete_match(match_id):
	try:
		match = PongMatch.objects.get(match_id=match_id)
	except PongMatch.DoesNotExist:
		return
	match.Player1.is_playing = False
	match.Player1.is_waiting = False
	match.Player2.is_playing = False
	match.Player2.is_waiting = False
	match.Player2.save()
	match.Player1.save()
	if match.tournament_match_id == -1:
		match.delete()

# LOCAL_TIMEZONE = datetime.datetime.now(datetime.timezone.utc).astimezone().tzinfo

from zoneinfo import ZoneInfo
import pytz
import datetime

@database_sync_to_async
def my_connect(self, room_name):
	print("wss connected")
	print(self.scope["user"].public_username)
	try:
		user = User.objects.get(public_username=self.scope["user"].public_username)
		if not user.is_authenticated:
			print("NOT LOGIN")
			self.close()
			return ""
	except User.DoesNotExist:

		self.close()
		return ""
	if (room_name == ""):
		room_name = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
		pong_room_list = PongRoom.objects.filter(is_full=False, tournament_mode=False)
		if pong_room_list.first() == None:
			pong_room = PongRoom.objects.create(name=room_name, nb_user=0,
								is_full=False, first_player=user, match_id=room_name)
		else:
			pong_room = pong_room_list.first()
	else:
		try:
			pong_room = PongRoom.objects.get(name=room_name)
			if pong_room.is_full == True:
				print("ERROR PONGROOM FULL")
				return ""
		except PongRoom.DoesNotExist:
			pong_room = PongRoom.objects.create(name=room_name, nb_user=0,
								is_full=False, first_player=user, match_id=room_name, tournament_mode=True)

	print(f"ROOM NAME:{pong_room.name}")
	pong_room.nb_user = pong_room.nb_user + 1
	print(f"ROOM NBUSER:{pong_room.nb_user}")
	if pong_room.nb_user >= 2:
		pong_room.is_full = True
		print("SETTING ROOM FULL TO TRUE")
		pong_room.match_id = pong_room.name
		create_match(pong_room.first_player, user, pong_room.match_id)
	pong_room.save()
	return pong_room.name

@database_sync_to_async
def disco(self):
	user = User.objects.get( public_username=self.scope["user"].public_username)
	user.is_waiting = False
	user.save()
	if user.is_playing == True:
		user.is_playing = False
		user.save()
		try:
			print(f'DECO match id:{user.current_match_id}')
			# try:
			# 	# (self.channel_layer.group_send)(
			# 	# self.room_group_name, {
			# 	# 	"type": "game.message",
			# 	# 	"status": "leave-lobby",
			# 	# 	}
			# 	# )

			# except AttributeError:
			# 	return
			match = PongMatch.objects.get(match_id=user.current_match_id)
			match.Player1.is_playing = False
			match.Player1.is_waiting = False
			match.Player2.is_playing = False
			match.Player2.is_waiting = False
			match.Player1.save()
			match.Player2.save()
		except PongMatch.DoesNotExist:
			pass
	else:
		try:
			room = PongRoom.objects.get(name=self.room_name)
			room.delete()
		except:
			pass
	

@database_sync_to_async
def match_won(self,text_data_json):
	try:
		print(f"getting match id{self.room_name}")
		match = PongMatch.objects.get(match_id=self.room_name)
	except PongMatch.DoesNotExist:
		return ""
	match.is_running=False
	user = User.objects.get(public_username=self.scope["user"].public_username)
	print ("USER WON:")
	print(self.scope["user"].public_username)
	match.winner_name = user.public_username
	match.loser_name = match.Player2_name if user.public_username != match.Player2_name else match.Player1_name
	
	match.Winner = user
	match.Loser = match.Player2 if user.public_username != match.Player2_name else match.Player1
	

	match.Winner.nb_win_pong += 1
	match.Winner.nb_goal_scored += int (text_data_json["win_score"])
	match.Winner.nb_goal_taken += int (text_data_json["loser_score"])
	match.Loser.nb_goal_scored += int (text_data_json["loser_score"])
	match.Loser.nb_goal_taken += int (text_data_json["win_score"])
	match.winner_score = int (text_data_json["win_score"])
	match.loser_score = int (text_data_json["loser_score"])
	match.Loser.nb_lose_pong += 1
	match.Loser.games_played_pong += 1
	match.Winner.games_played_pong += 1
	match.Loser.is_playing = False
	match.Winner.is_playing = False
	if (text_data_json["reason"] == "rage-quit"):
		match.Loser.nb_match_rage_quit += 1
	match.save()
	match.Winner.save()
	match.Loser.save()


def create_match(Player1, Player2, id):
	try:
		new_match = PongMatch.objects.get(match_id=id)
	except PongMatch.DoesNotExist:
		new_match = PongMatch(match_id=id,
					   	date=datetime.datetime.now().strftime("%Y%m%d%H%M%S"),
						Player1=Player1, Player2=Player2,
						Player1_name=Player1.public_username,
						Player2_name=Player2.public_username,
						Winner=Player1, Loser=Player2, is_running=True
						)
	new_match.save()
	print(f" match created id:{new_match.match_id}")
	Player1.current_match_id = id
	Player2.current_match_id = id
	Player1.is_waiting = False
	Player1.is_playing = True
	Player2.is_playing = True
	Player2.is_waiting = False
	Player1.save()
	Player2.save()
	return new_match