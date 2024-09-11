from django.core.management.base import BaseCommand
from game.models import PongRoom, Tournament, PongMatch, UserStatus
from django.utils.crypto import get_random_string


from django.contrib.auth import get_user_model
User = get_user_model()

from django.utils.crypto import get_random_string

from pathlib import Path
import os

current_dir = Path(__file__).resolve().parent.parent.parent.parent
path_static = str(current_dir) + "/static/"
save_dir = str(current_dir) + "/profile_image/"

class Command(BaseCommand):

	def handle(self, *args, **options):
		PongRoom.objects.all().delete()
		print("PONG ROOM CLEARED")
		Tournament.objects.all().delete()
		print("ONGOING TOURNAMENT CLEARED")
		print("KICKING USER FROM GAME/TOURNAMENT")
		try:
			user = User.objects.filter(is_playing=True)
			for i in user:
				i.is_playing = False
				i.save()
		except User.DoesNotExist:
			pass
		try:
			user = User.objects.filter(is_waiting=True)
			for i in user:
				i.is_waiting = False
				i.save()
		except User.DoesNotExist:
			pass
		try:
			user = User.objects.filter(is_online=True)
			for i in user:
				i.is_online = False
				i.save()
		except User.DoesNotExist:
			pass
		try:
			user = User.objects.filter(is_in_tournament=True)
			for i in user:
				i.is_in_tournament = False
				i.save()
		except User.DoesNotExist:
			pass

		try:
			user = User.objects.get(username="invited")
			user.profile_picture_full_name = "invited.png"
			user.save()
		except User.DoesNotExist:
			user = User.objects.create(username="invited", public_username="invited", password=get_random_string(30), profile_picture=save_dir + "invited.png", profile_picture_full_name="invited.png",  email=get_random_string(42))
		
		try:
			user = User.objects.get(username="ai")
			user.profile_picture_full_name = "bot.png"
			user.save()
		except User.DoesNotExist:
			user = User.objects.create(username="ai", public_username="ai", password=get_random_string(30), email=get_random_string(42), profile_picture_full_name="bot.png", profile_picture=save_dir + "bot.png")

		match = PongMatch.objects.filter(is_running=True)
		for i in match:
			i.is_running = False
			i.save()


		user_status = UserStatus.objects.filter(is_online=True)
		for i in user_status:
			i.is_online = False
			i.save()


		print("STARTUP  SCRIPT COMPLETED")
