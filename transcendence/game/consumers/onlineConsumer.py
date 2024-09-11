import datetime, json

from channels.generic.websocket import  AsyncWebsocketConsumer
from asgiref.sync import async_to_sync

from game.models import PongMatch, Tournament

from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from game.views import get_friends_list_status
User = get_user_model()

from channels.db import database_sync_to_async

from game.models import UserStatus
from game.serializers import  UserSerializer, PongMatchSerializer, TournamentSerializer


class onlineConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		try:
			a = self.scope["user"].public_username
		except AttributeError:
				return self.close()
		try:
			user = await get_user(self.scope["user"].username)
		except User.DoesNotExist:
			return await self.close()
		
		if user.is_authenticated == False:
			return self.close()
		await set_user_online_status(user, True)
		self.room_name = "online_check"
		self.room_group_name = self.room_name
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		try:
			a = self.scope["user"].public_username
		except AttributeError:
				return
		try:
			user = await get_user(self.scope["user"].username)
			await set_user_online_status(user, False)
		except User.DoesNotExist:
			return await self.close()
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		return

	async def receive(self, text_data):
		try:
			user = await get_user(self.scope["user"].username)
		except User.DoesNotExist:
			pass
		data = json.loads(text_data)
		if data["query_type"] == "friends_status":
			friends_list = await serialize_friend_list(user)
			await self.send(json.dumps({
					"type" : "online.message",
					"query_type" : "friends_status",
					"payload": friends_list
				}))
		elif data["query_type"] == "match_list":
			match_list = await serialize_pong_match()
			await self.send(json.dumps({
					"type" : "online.message",
					"query_type" : "match_list",
					"payload": match_list
				}))
		elif data["query_type"] == "tournament_list":
			tournament_list = await serialize_tournament_list()
			await self.send(json.dumps({
					"type" : "online.message",
					"query_type" : "tournament_list",
					"payload": tournament_list
				}))

	async def online_message(self, event):
		try:
			await self.send(text_data=json.dumps({"message": event}))
		except:
			pass

@database_sync_to_async
def serialize_tournament_list():
	tournament = Tournament.objects.filter(is_running=False)
	serialize = list(TournamentSerializer(tournament, many=True).data)
	return serialize

@database_sync_to_async
def serialize_pong_match():
	match = PongMatch.objects.filter(is_running=True)
	data = []
	for i in match:
		new_data = [{"match_id" : i.match_id,
			  		"current_score_player_1" : i.current_score_player_1,
			  		"current_score_player_2" : i.current_score_player_2,
			  		"Player1_name" : i.Player1_name,
			  		"Player2_name" : i.Player2_name,
			}]
		data += new_data
	return data
	# return PongMatchSerializer(match, many=True).data
	pass

def get_friends_list_status_full(friend_list):
	data = []
	friend_list_status = get_friends_list_status(friend_list)
	for friend in friend_list:
		data += [{
			"username" : friend.username,
			"is_online" : friend_list_status[friend.username],
			"is_playing" : friend.is_playing,
		}]
	return data


@database_sync_to_async
def serialize_friend_list(user):
	return get_friends_list_status_full(user.friends.all())

@database_sync_to_async
def set_user_online_status(user, status):
	try:
		user_status = UserStatus.objects.get(username=user.username)
		user_status.is_online = status
	except UserStatus.DoesNotExist:
		user_status = UserStatus.objects.create(username=user.username, is_online=status)
	user_status.save()

@database_sync_to_async
def get_user(username):
	return User.objects.get(username=username)
