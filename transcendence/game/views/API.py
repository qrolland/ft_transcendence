from django.shortcuts import render

from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.shortcuts import render

from game.serializers import  UserSerializer, PongMatchSerializer, TournamentSerializer
from rest_framework.parsers import JSONParser
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from game.models import PongMatch, Tournament, TicTacToeGame, UserStatus
import json,datetime

from game.forms import UploadFileForm, UsernameChangeForm
from django.core.serializers import serialize
from itertools import chain
import os
from pathlib import Path
from game.views.test import is_username_valid



User = get_user_model()

import random, string

current_dir = Path(__file__).resolve().parent.parent.parent
path_static = str(current_dir) + "/static/"
save_dir = str(current_dir) + "/profile_image/"
url_login = os.environ.get('BASE_URL_HTTPS') + '/accounts/login'


@login_required(login_url=url_login)
def search_user_exist(request, username):
	if request.method == 'GET':
		try:
			user = User.objects.get(username=username)
			return JsonResponse({"user_exist" : "True"})
		except User.DoesNotExist:
			return JsonResponse({"user_exist" : "False"})
	return HttpResponse(status=404)


@login_required(login_url=url_login)
def online_status(request):
	user = request.user
	friends_list = user.friends
	data = UserSerializer(friends_list, many=True).data
	return JsonResponse(data, safe=False)
	

@login_required(login_url=url_login)
def get_top_pong(request, number_user_requested):
	number_user_requested = int (number_user_requested)
	user_list  = User.objects.all().order_by('-nb_win_pong')
	user_data = []
	position = -1
	current_user = request.user
	if number_user_requested > 100 or number_user_requested <= 0:
		number_user_requested = 100
	index = -1
	for user in user_list:
		index += 1
		if user.public_username == user.public_username:
			position = index
		if index > number_user_requested:
			if position != -1:
				break
			continue
		user_data.append({
				"username" : user.public_username,
				"nb_win" : user.nb_win_pong,
				"nb_lose" : user.nb_lose_pong
		})

		if index == number_user_requested:
			break
	user_data.append({
			"whoami" : current_user.public_username,
			"position" : position,
			"nb_player_total" : user_list.count()
	})
	return JsonResponse(user_data, safe=False)

def randomword(length):
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))

def serialize_match(match):

	data = []
	for i in match:
		newdict = [{"id":i.id, "winner_name":i.Winner.public_username, "loser_name":i.Loser.public_username}]
		data += newdict
	return data


@login_required(login_url=url_login)
def get_all_match(request):
	if request.method == 'GET':
		match = PongMatch.objects.all()
		serialize = serialize_match(match)
		return JsonResponse(serialize, safe=False)
	return HttpResponse(status=404)

@login_required(login_url=url_login)
def getTournamentList(request):
	if request.method == 'GET':
		try:
			tournament = Tournament.objects.filter(is_running=False)
			serialize = list(TournamentSerializer(tournament, many=True).data)
			return JsonResponse(serialize, safe=False)
		except Tournament.DoesNotExist:
			return JsonResponse("", safe=False)
	return HttpResponse(status=404)


@login_required(login_url=url_login)
def whoami(request):
	user = request.user
	if request.method == 'GET':
		info = {"username":user.public_username}
		return JsonResponse(info)
	info = {"username":"None"}
	return JsonResponse(info)


@login_required(login_url=url_login)
def get_match_user(request, user_name):
	no_match_found = True
	data1 = None
	data2 = None
	try:
		user = User.objects.get(public_username=user_name)
	except User.DoesNotExist:
		info = {"nb_match":"zero"}
		return JsonResponse(info, safe=False)
	if (request.method == 'GET'):
		match = PongMatch.objects.filter(Player1=user)
		if match.first() != None:
			data1 = list(PongMatchSerializer(match, many=True).data)
			# data1 = serialize_match(match)
			no_match_found = False
		match = PongMatch.objects.filter(Player2=user)
		if match.first() != None:
			data2 = list(PongMatchSerializer(match, many=True).data)
			# data2 = serialize_match(match)
			no_match_found = False

		if no_match_found == True:
			info = {"nb_match":"zero"}
			return JsonResponse(info, safe=False)

		data = []
		if (data1 != None):
			data += (data1)
		if (data2 != None):
			data +=  (data2)

		return JsonResponse(data, safe=False)

@login_required(login_url=url_login)
def update_username(request):
	info = {"username": "none"}
	if request.method == 'POST':
		username = request.user
		try:
			user = User.objects.get(public_username=username)
		except User.DoesNotExist:
			return JsonResponse(info)
		data = JSONParser().parse(request)
		new_username = data["public_username"]
		try:
			newuser = User.objects.get(public_username=new_username)
		except User.DoesNotExist:
			print (f"NEW USERNAME:{new_username}" )
			info = {"username": new_username}
			user.public_username = new_username
			user.save()
			return JsonResponse(info)
		return JsonResponse(info)

@login_required(login_url=url_login)
def profile_picture(request):
	username = request.user
	try:
		user = User.objects.get(username=username)
	except User.DoesNotExist:
		return  HttpResponse(status=404)

	if request.method == 'GET':
		return HttpResponse(user.profile_picture, content_type="image/png")

	elif request.method == 'POST':
		form = UploadFileForm(request.POST, request.FILES)
		if form.is_valid():
			# handle_uploaded_file(request.FILES["file"])
			user.profile_picture = request.FILES["file"]
			return  HttpResponse(status=200)
	return HttpResponse(status=404)

from django.http import FileResponse

@login_required(login_url=url_login)
def get_profile_picture(request, img_name):
	try:
		user = User.objects.filter(profile_picture_full_name=img_name)
		if user.first() == None:
			return HttpResponse(status=404)	
		try:
			return HttpResponse(user.first().profile_picture, content_type="image/png")
		except FileNotFoundError:

			return HttpResponse(status=404)
	except User.DoesNotExist:
			pass
	return HttpResponse(status=404)

def remove_image(image_name):
	print (f"removing {image_name}")
	if image_name.find("avatar1.png") == -1 and image_name.find("avatar2.png") == -1 and image_name.find ("avatar3.png") == -1 and  image_name.find("avatar4.png") == -1 and image_name.find ("willow.png") == -1 and image_name.find("bot.png") == -1 and image_name.find ("invited.png") == -1:
		try: 
			os.remove( image_name)
			print (f"removed {image_name}")
		except FileNotFoundError:
			pass

@login_required(login_url=url_login)
def upload_picture(request):
	if request.method == 'POST':
		image = request.body
		user = request.user
		rand_suffix = randomword(4)
		new_file = open(save_dir + user.username + rand_suffix + ".png", "wb")
		new_file.write(image)
		new_file.close()
		if user.profile_picture.name.find("images") == -1:
			user.old_profile_picture_name = user.profile_picture.name
		user.profile_picture = save_dir + user.username + ".png"
		user.profile_picture.name = save_dir + user.username +  rand_suffix + ".png"
		user.profile_picture_full_name = user.username + rand_suffix + ".png"
		user.save()
		remove_image(user.old_profile_picture_name)
		return  HttpResponse(status=200)
	return HttpResponse(status=404)

@login_required(login_url=url_login)
def settings_update(request):
    user = request.user
    if user.is_playing == True or user.is_in_tournament == True or user.is_waiting == True:
        return JsonResponse({'sucess' : 'False'}, safe=False)
		
    if request.method == 'POST':
        username_form = UsernameChangeForm(request.POST)
        # avatar_form = AvatarChangeForm(request.POST)
        success = True
        if username_form.is_valid():
            new_username = username_form.cleaned_data['username']
            if len (new_username) > 20 or is_username_valid(new_username) == False:
                 return JsonResponse({'sucess' : 'False'}, safe=False)  
            if User.objects.filter(public_username=new_username).exclude(pk=request.user.pk).exists():
                success = False
            else:
                # Le nouveau nom d'utilisateur est unique, alors effectuer la modification
                request.user.public_username = new_username
                request.user.save()
                success = True
            print(f"Username changed to: {new_username}")

        selected_avatar_url = request.POST.get('selected-avatar')
        selected_avatar_url = selected_avatar_url.split('/')[-1]
        if selected_avatar_url:
            old_name =  request.user.profile_picture.name
            request.user.profile_picture =  save_dir + selected_avatar_url
            request.user.profile_picture.name = save_dir + selected_avatar_url
            request.user.profile_picture_full_name = selected_avatar_url
            request.user.save()
            print(f"Profile picture changed to: {selected_avatar_url}")
            remove_image(old_name)

        context = {'success': success}
        return JsonResponse(context, safe=False)
    return HttpResponse(status=404)


@login_required(login_url=url_login)
def settings_html(request):
    template = loader.get_template("game/settings.html")
    html_content = template.render({"": ""}, request)
    return HttpResponse(html_content)

@login_required(login_url=url_login)
def game_update(request):
	if request.method == 'POST':
		body_unicode = request.body.decode('utf-8')
		data = json.loads(body_unicode)
		new_games_played_ttt = data['games-played-ttt']
		if new_games_played_ttt:
			request.user.games_played_ttt = new_games_played_ttt
	
		
		winner_username = data['winner-ttt']
		opponent_username = data['opponent-ttt']
		if winner_username == request.user.public_username:
			request.user.nb_win_ttt += 1
		else:
			request.user.nb_lose_ttt += 1
		board = data['board']
		request.user.save()

		try:
			winner_user = User.objects.get(public_username=winner_username)
		except User.DoesNotExist:
	
			winner_user = None
		try:
			opponent_user = User.objects.get(public_username=opponent_username)
		except User.DoesNotExist:
			opponent_user = None
		tttgame = TicTacToeGame.objects.create(
			player=request.user,
			opponent=opponent_user,
			winner=winner_user,
			date_played=datetime.datetime.now().strftime("%Y%m%d%H%M"),
			board=board
		)
		print(f'TicTacToeGame created: player={tttgame.player}, opponent={tttgame.opponent}, winner={tttgame.winner}')
		template = loader.get_template("game/game.html")
		return HttpResponse(template.render({"":""},request))
	return HttpResponse(status=404)



@login_required(login_url=url_login)
def pong_game_ai(request):
	if request.method == 'POST':
		body_unicode = request.body.decode('utf-8')
		data = json.loads(body_unicode)
		winner_name = data["winner"]
		loser_name = data["loser"]
		winner_score = data["winner_score"]
		loser_score = data["loser_score"]
		date = datetime.datetime.now().strftime("%Y%m%d%H%M")
		if winner_name == "human":
			winner_name = request.user.public_username
			winner = request.user
			try:
				loser = User.objects.get(username=loser_name)
				opp = loser
			except User.DoesNotExist:
				return HttpResponse(status=403)
		elif loser_name == "human":
			loser_name = request.user.public_username
			loser = request.user
			try:
				winner = User.objects.get(username=winner_name)
				opp = winner
			except User.DoesNotExist:
				return HttpResponse(status=403)
		else:
			return HttpResponse(status=403)
		PongMatch.objects.create(Winner=winner, Loser=loser, winner_score=winner_score, loser_score=loser_score, Player1=request.user, Player2=opp, date=date, match_id=date)
	return HttpResponse(status=201)


@login_required(login_url=url_login)
def game_html(request):
    template = loader.get_template("game/game.html")
    return HttpResponse(template.render({"":""},request))

@login_required(login_url=url_login)
def profile_update(request):
	friends_list = []
	if request.method == 'POST':
		friend_username = request.POST.get('username')
		try:
			friend = User.objects.get(public_username=friend_username)
			if friend != request.user:
				request.user.friends.add(friend)
				success = True
			else:
				success = False
		except User.DoesNotExist:
			success = False
		friends_list = request.user.friends.all()
		friends_json = serialize('json', friends_list)  # Convertir en JSON
		context = {'friends_list': friends_json, 'success': success}
		return JsonResponse(context, safe=False)
	return HttpResponse(status=404)


def calculate_trust_factor(user):
	try:
		match_trust = 1.0 - user.nb_match_rage_quit / (user.games_played_pong + user.games_played_ttt) 
	except ZeroDivisionError:
		match_trust = 1.0
	try:
		tournament_trust = 1.0 -  user.nb_tournament_rage_quit / (user.nb_tournament_played) 
	except ZeroDivisionError:
		tournament_trust = 1.0
	try:
		tournament_trust_admin = 1.0 -  user.nb_tournament_rage_quit_admin / (user.nb_tournament_played) 
	except ZeroDivisionError:
		tournament_trust_admin = 1.0
	user.trust_factor = (match_trust + 5 * tournament_trust + 5 * tournament_trust_admin ) / 11.0 * 100.0
	user.trust_factor = round(user.trust_factor, 2)
	if user.trust_factor < 0:
		user.trust_factor = 0.0
	if user.trust_factor > 100.0:
		user.trust_factor = 100.0


def get_match_win_stat(user):
	match_won = PongMatch.objects.filter(Winner=user)
	match_lost = PongMatch.objects.filter(Loser=user)
	user.nb_win_pong = match_won.count()
	user.nb_lose_pong = match_lost.count()
	user.games_played_pong = user.nb_win_pong + user.nb_lose_pong
	return user

@login_required(login_url=url_login)
def profile_html(request, username=None):
	if username == None:
		display_add_friend = True
		user = request.user
	else:
		display_add_friend = False
		# user = request.user

		try:
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			return HttpResponse(status=404)
		
	tttgames1 = TicTacToeGame.objects.filter(player=user)
	pongmatches1 = PongMatch.objects.filter(Player1=user)
	pongmatches2 = PongMatch.objects.filter(Player2=user)

	games = list(chain(tttgames1, pongmatches1, pongmatches2))
	sorted_games = sorted(games, key=lambda x: x.date_played if isinstance(x, TicTacToeGame) else x.date, reverse=True)
	friends_list = list(user.friends.all())
	
	try:
		user.nb_goal_scored_average = round (user.nb_goal_scored / user.games_played_pong, 2)
	except ZeroDivisionError:
		pass
	try:
		user.nb_goal_taken_average = round (user.nb_goal_taken / user.games_played_pong, 2)
	except ZeroDivisionError:
		pass
	calculate_trust_factor(user)
	user.nb_tournament_lost = user.nb_tournament_played -  user.nb_tournament_won
	user = get_match_win_stat(user)
	user.save()
	friend_list_status = get_friends_list_status(friends_list)
	context = {'friends_list': friends_list, 'games': sorted_games, 'friends_list_status' : friend_list_status, 'display_add_friend' :display_add_friend, 'user' : user, 'save_dir' : save_dir}
	return render(request, "game/profile.html", context)

def get_friends_list_status(friends_list):
	# Entry.objects.filter(id__in=[1, 3, 4])
	friends_list_username = []
	for friend in friends_list:
		friends_list_username.append(friend.username)
	friend_list_status = UserStatus.objects.filter(username__in= friends_list_username)
	new_list = {}
	for friend in friend_list_status:
		new_list[friend.username] = friend.is_online
	return new_list



@login_required(login_url=url_login)
def remove_friend(request):
	user = request.user
	if request.method == 'POST':
		body = request.body.decode('utf-8')
		data = json.loads(body)
		try:
			friend_to_remove_username = data["username"]
			try:
				friend = User.objects.get(username=friend_to_remove_username)
				user.friends.remove(friend)
				user.save()
				return HttpResponse(status=200)
			except User.DoesNotExist:
				return HttpResponse(status=400)
		except KeyError:
			return HttpResponse(status=400)
	return HttpResponse(status=404)