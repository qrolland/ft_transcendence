import json, datetime

from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync

from game.models import PongMatch

from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

from channels.db import database_sync_to_async

from game.models import PongRoom, TTTRoom


class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		try:
			a = self.scope["user"].public_username
		except AttributeError:
				return self.close()
		name = await initialized(self)
		nb_user = await getNbUserTTT(name)
		self.room_name = name
		self.room_group_name = f"pong{self.room_name}"
		await (self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
		status = "run-game" if nb_user == 2 else "join-lobby"
		self.active_player = 1
		await (self.channel_layer.group_send)(
			self.room_group_name, {
				"type": "game.message",
				"status": status,
				"player_id": nb_user,
				"nb_users": nb_user,
			}
		)
		await self.accept()

	async def game_message(self, event):
		await self.send(text_data=json.dumps({"message": event}))

	async def disconnect(self, close_code):
		try:
			a = self.scope["user"].public_username
		except AttributeError:
				return 
		await discoTTT(self)
		try:
			await (self.channel_layer.group_send)(
				self.room_group_name, {
					"type": "game.message",
					"status": "player-left",
					}
				)
		except AttributeError:
			pass

	async def receive(self, text_data):
		data = json.loads(text_data)
		status = None
		player1_name, player2_name = await get_players_names(self.room_name)
		if 'status' in data:
			if data['status'] == 'player-left':
				status = 'player-left'
			else:
				status = None
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					"type": "game.message",
					"status": status,
				}
			)
		if "x" in data and "y" in data:
			x = data["x"]
			y = data["y"]
			if self.active_player is not None:
				self.active_player = 3 - self.active_player
			await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game.message",
                    "x": x,
                    "y": y,
					"player1_name": player1_name,
					"player2_name": player2_name,
					"status": status,
                }
            )


@database_sync_to_async
def discoTTT(self):
	user = User.objects.get( username=self.scope["user"].username)
	if user.is_playing == True:
		user.is_playing = False
		user.save()

@database_sync_to_async	
def getNbUserTTT(room_name):
	try:
		ttt_room = TTTRoom.objects.get(name=room_name)
		return ttt_room.nb_user
	except TTTRoom.DoesNotExist:
		return 0
	
@database_sync_to_async
def get_players_names(room_name):
    try:
        room = TTTRoom.objects.get(name=room_name)
        player1_name = room.player1.public_username if room.player1 else ""
        player2_name = room.player2.public_username if room.player2 else ""
        return player1_name, player2_name
    except TTTRoom.DoesNotExist:
        return "", ""
	
@database_sync_to_async
def initialized(self):
    try:
        user = User.objects.get(username=self.scope["user"])
        if not user.is_authenticated:
            return self.close()
    except User.DoesNotExist:
        return self.close()
    user.is_playing = True
    user.save()
    room_name = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    try:
        ttt_room = TTTRoom.objects.get(is_full=False)
    except TTTRoom.DoesNotExist:
        ttt_room = TTTRoom.objects.create(name=room_name, nb_user=0, is_full=False, player1=user, player2=None)
    ttt_room.nb_user += 1
    if ttt_room.nb_user == 2:
        ttt_room.player2 = user
    if ttt_room.player2 == ttt_room.player1:
        ttt_room.nb_user -= 1
    if ttt_room.nb_user >= 2:
        ttt_room.is_full = True
    ttt_room.save()
    return ttt_room.name
