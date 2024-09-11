from django.db import models
# Create your models here.
from django.contrib.auth.base_user import AbstractBaseUser,BaseUserManager
from django.utils import timezone
import pytz
from django.contrib.sessions.models import Session
from pathlib import Path

class MyUserManager(BaseUserManager):
	def create_user(self, email, username, password, public_username):
		if not username:
			raise ValueError('User must have a valid username')
		if not email:
			raise ValueError('User must have a valid email')
		user = self.model(username=username, email=email, public_username=public_username, elo=1000)
		user.set_password(password)
		user.save(using=self._db)
		return user

def serialize_date(date):
	hour = int (date[8:10])
	AM = " AM"
	# 2024 03 14 00 04 57
	if hour > 12:
		hour = int (hour - 12)
		AM = " PM"
	new_date = date[4:6] + "/" + date[6:8] + "/" + date[2:4] + " " + str (hour) + ":" + date[10:12] + AM
	return new_date

current_dir = Path(__file__).resolve().parent.parent
save_dir = str(current_dir) + "/profile_image/"

class MyUser(AbstractBaseUser):
	username = models.CharField(max_length=200, unique=True)
	public_username = models.CharField(max_length=200, unique=True)
	email = models.CharField(max_length=200, unique=True)
	elo = models.IntegerField(default=1000)
	# current_match = models.ForeignKey('PongMatch',
	# 						on_delete=models.DO_NOTHING,
	# 						related_name="current_match")
	USERNAME_FIELD = "username"
	objects     =   MyUserManager()
	current_match_id = models.CharField(max_length=200, default="0")
	is_playing = models.BooleanField(default=False)
	is_in_tournament = models.BooleanField(default=False)
	profile_picture = models.ImageField(upload_to="images", default=save_dir + "willow.png", max_length=255)
	old_profile_picture_name = models.CharField(default="None")
	profile_picture_full_name = models.CharField(default="willow.png", max_length=255)
	games_played_ttt = models.IntegerField(default=0)
	nb_win_ttt = models.IntegerField(default=0)
	nb_lose_ttt = models.IntegerField(default=0)
	nb_draw_ttt = models.IntegerField(default=0)
	friends = models.ManyToManyField('self', blank=True, default=None)
	is_online = models.BooleanField(default=False)
	last_ping = models.CharField(max_length=100, default="0")
	games_played_pong = models.IntegerField(default=0)
	nb_win_pong = models.IntegerField(default=0)
	nb_lose_pong = models.IntegerField(default=0)
	is_waiting = models.BooleanField(default=False)
	alias_tournament=models.CharField(max_length=200, default="none")
	nb_goal_scored=models.IntegerField(default=0)
	nb_goal_scored_average=models.IntegerField(default=0)
	nb_goal_taken=models.IntegerField(default=0)
	nb_goal_taken_average=models.IntegerField(default=0)
	nb_tournament_won=models.IntegerField(default=0)
	nb_tournament_lost=models.IntegerField(default=0)
	nb_tournament_played=models.IntegerField(default=0)
	nb_match_rage_quit=models.IntegerField(default=0)
	nb_tournament_rage_quit=models.IntegerField(default=0)
	trust_factor=models.FloatField(default=100.0)
	nb_tournament_rage_quit_admin=models.IntegerField(default=0)

class UserStatus(models.Model):
	username=models.CharField(max_length=200, default="ImTooDumbForAsync")
	is_online=models.BooleanField(default=True)

class PongMatch(models.Model):
	match_id = models.CharField(max_length=200, default="0",null=True)
	date = models.CharField(max_length=200, default="42424242424242",null=True)
	Player1 = models.ForeignKey(MyUser,
							on_delete=models.PROTECT,
							related_name="Player1",null=True)
	Player2 = models.ForeignKey(MyUser,
							on_delete=models.PROTECT,
							related_name="Player2",null=True)
	Player1_name = models.CharField(max_length=200,null=True)
	Player2_name = models.CharField(max_length=200,null=True)
	Winner = models.ForeignKey(MyUser,
							on_delete=models.PROTECT, default=None,
							related_name="winner",null=True)
	Loser = models.ForeignKey(MyUser,
							on_delete=models.PROTECT, default=None,
							related_name="loser",null=True)
	winner_score = models.IntegerField(default=0)
	loser_score = models.IntegerField(default=0)
	winner_name = models.CharField(max_length=200, default="None",null=True)
	loser_name = models.CharField(max_length=200, default="None",null=True)
	tournament_level = models.IntegerField(default=-1,null=True)
	tournament_id = models.CharField(max_length=200, default="none",null=True)
	tournament_match_id = models.IntegerField(default=-1,null=True)
	is_running = models.BooleanField(default=False)
	current_score_player_1 = models.IntegerField(default=0)
	current_score_player_2 = models.IntegerField(default=0)

	def __str__(self):
		return self.match_id
	def date_serializer(self):
		return serialize_date(self.date)

# return self.date_played.strftime("%m/%d/%y %I:%M %p")

class PongRoom(models.Model):
	name = models.CharField(max_length=200)
	nb_user = models.IntegerField(default=0)
	is_full = models.BooleanField(default=False)
	first_player = models.ForeignKey(MyUser,
							on_delete=models.PROTECT,
							related_name="first_player")
	match_id = models.CharField(max_length=200)
	tournament_mode = models.BooleanField(default=False)
	def __str__(self):
		return self.name



class Tournament(models.Model):
	name = models.CharField(max_length=200, unique=True, default="LOL")
	player = models.ManyToManyField(MyUser)
	admin = models.ForeignKey(MyUser,
							on_delete=models.PROTECT,
							related_name="admin")
	is_running = models.BooleanField(default=False)
	nb_player=models.IntegerField(default=1)
	match = models.ManyToManyField(PongMatch)
	winner = models.ForeignKey(MyUser,
							on_delete=models.PROTECT,
							related_name="winner_tournament", null=True)
	display_name = models.CharField(max_length=200, default="Tournament")
	display_name = models.CharField(max_length=200, default="Tournament")
	def __str__(self):
		return self.name

class TicTacToeGame(models.Model):
    # date_played = models.DateTimeField(auto_now_add=True)
    date_played = models.CharField(max_length=30, default="42424242424242")
    player = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='player_ttt')
    opponent = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='opponent_ttt', null=True, blank=True)
    winner = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='winner_ttt', null=True, blank=True)
    board = models.CharField(max_length=10, default="000000000")
    def date(self):
         return serialize_date(self.date_played)

	# Utilisez le format de date/heure souhaité, par exemple "28 février 2022 à 15h30"
        # return self.date_played.strftime("%m/%d/%y %I:%M %p")

class TTTRoom(models.Model):
    name = models.CharField(max_length=200)
    nb_user = models.IntegerField(default=0)
    is_full = models.BooleanField(default=False)
    player1 = models.ForeignKey(MyUser, related_name='player1', on_delete=models.CASCADE, null=True, blank=True)
    player2 = models.ForeignKey(MyUser, related_name='player2', on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return self.name
