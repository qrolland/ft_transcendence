from django.shortcuts import render
# Create your views here.

from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.http import Http404
from django.shortcuts import render

from game.serializers import  UserSerializer, PongMatchSerializer
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
import requests
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, get_user_model

import re
from game.models import PongMatch
import json, datetime
from django.utils.crypto import get_random_string
from django.core.files import File
import os
from django.contrib.auth import authenticate

import logging
# logging.basicConfig(filename='debug.log', encoding='utf-8', level=print)

#use custom User model
User = get_user_model()
url_login = os.environ.get('BASE_URL_HTTPS') + '/accounts/login'

def page_not_found_view(request, exception):
	if request.user.is_authenticated:
		template = loader.get_template("game/base.html")
		return HttpResponse(template.render({"":""},request))

	else:
		template = loader.get_template("game/login.html")
		return HttpResponse(template.render({"":""},request))



@login_required(login_url=url_login)
def ping(request):
	user = request.user
	user.last_ping = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
	user.save()
	return JsonResponse({"PONG":"PONG"}, safe=False)


@login_required(login_url=url_login)
def index(request, public_username=None):
	template = loader.get_template("game/base.html")
	return HttpResponse(template.render({"":""},request))

@login_required(login_url=url_login)
def home_html(request):
	template = loader.get_template("game/home.html")
	return HttpResponse(template.render({"":""},request))


from pathlib import Path
current_dir = Path(__file__).resolve().parent.parent.parent
path_static = str(current_dir) + "/static/"
save_dir = str(current_dir) + "/profile_image/"

@login_required(login_url='accounts/login/')
def top_html(request):
	players_ttt = User.objects.all().order_by('-nb_win_ttt')
	players_pong = User.objects.all().order_by('-nb_win_pong')
	try:
		players_pong = players_pong.exclude(public_username="invited")
		players_pong = players_pong.exclude(public_username="ai")
	except:
		pass
	try:
		players_ttt = players_ttt.exclude(public_username="ai")
		players_ttt = players_ttt.exclude(public_username="invited")
	except:
		pass
	context = {'players_ttt': players_ttt, 'players_pong': players_pong, 'save_dir' : save_dir}
	return render(request, 'game/top.html', context)


@login_required(login_url=url_login)
def about_html(request):
	template = loader.get_template("game/about.html")
	return HttpResponse(template.render({"":""},request))

@login_required(login_url=url_login)
def lorem_html(request):
	template = loader.get_template("game/lorem.html")
	return HttpResponse(template.render({"":""},request))



@login_required(login_url=url_login)
def landing(request):
	if request.method == 'GET':
		user = User.objects.all()
		serialize = UserSerializer(user, many=True)
		return JsonResponse(serialize.data, safe=False)

	elif request.method == 'POST':
		data = JSONParser().parse(request)
		serialize = UserSerializer(data=data)

		if serialize.is_valid():
			serialize.save()
			return JsonResponse(serialize.data, status=201)
		return HttpResponse(status=404)
	return HttpResponse(status=404)

@login_required(login_url=url_login)
def ponggame(request):
	template = loader.get_template("game/ponggame.html")
	return HttpResponse(template.render({"":""},request))

@login_required(login_url=url_login)
def tv_html(request):
	template = loader.get_template("game/tv.html")
	return HttpResponse(template.render({"":""},request))


@login_required(login_url=url_login)
def success(request):
	template = loader.get_template("game/game.html")
	return HttpResponse(template.render({"":""},request))


@login_required(login_url=url_login)
def test(request):
	template = loader.get_template("game/success.html")
	return HttpResponse(template.render({"":""},request))

@login_required(login_url=url_login)
def tournament_html(request):
	template = loader.get_template("game/tournament.html")
	return HttpResponse(template.render({"":""},request))


def fail(request):
	template = loader.get_template("game/login.html")
	return HttpResponse(template.render({"":""},request))

def login_page_pswd(request):
	template = loader.get_template("game/login_pswd.html")
	return HttpResponse(template.render({"":""},request))

def login_page(request):
	template = loader.get_template("game/login.html")
	return HttpResponse(template.render({"":""},request))



def loginoauth(request):
	# 127
	# url_oauth = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-5cf1d5e42b91535b46f4889e6ea12409b84a6b7912f94f7c6946518d6dd6253b&redirect_uri=https%3A%2F%2F127.0.0.1%3A8888%2Foauthlogin&response_type=code"
	#bess
	url_oauth = os.environ.get('OAUTH_LINK')
	if not request.user.is_authenticated:
		return redirect(url_oauth)
	else:
		try:
			username = request.GET.get('username', '')
			if username=="none":
				username = "LOL" + get_random_string(180)
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			return redirect(url_oauth)
			return redirect(url_oauth)
		login(user, request)
	return redirect(home_html)


@login_required(login_url=url_login)
def logout_page(request):
	user = request.user
	user.is_online = False
	user.last_ping = "1"
	user.save()
	logout(request)
	template = loader.get_template("game/login.html")
	return HttpResponse(template.render({"":""},request))



def is_username_valid(test_username):
	ret = re.search("[^a-zA-Z0-9]", test_username)
	if ret:
		return False
	return True

def password_create(request):
	new_email = "!" + get_random_string(42)
	post_data = json.loads(request.body.decode("utf-8"))
	username = post_data.get('username', '')
	if len(username) > 20 or is_username_valid(username) == False:
		return HttpResponse(status=301)

	password = post_data.get('password', '')
	if (username == '' or password == '' or len(password) < 5 or username == 'None' or username.isspace() == True):
		return HttpResponse(status=301)
	try:
		user = User.objects.get(public_username=username)
		return HttpResponse(status=301)
	except User.DoesNotExist:
		
		user = User.objects.create_user(new_email, get_random_string(50), password, username)
		login(request, user)
		return redirect (home_html)


def password_login(request):
	new_email = "!" + get_random_string(42)
	post_data = json.loads(request.body.decode("utf-8"))
	username = post_data.get('username', '')
	password = post_data.get('password', '')
	if (username == '' or password == ''):
		return HttpResponse(status=301)
	try:
		user = User.objects.get(public_username=username)
		user = authenticate(username=user.username, password=password)
		if user is None:
			return HttpResponse(status=301)
		login(request, user)
	except User.DoesNotExist:
			return HttpResponse(status=301)
	return redirect (home_html)
	


def oauthlogin_callback(request):
	clientid = os.environ.get('OAUTH_CLIENT_UID')
	secret = os.environ.get('OAUTH_SECRET')
	redirect_uri = os.environ.get('OAUTH_LINK_REDIRECT')

	if request.method == 'GET':
		code = request.GET.get('code', '')

		url = "https://api.intra.42.fr/v2/oauth/token"
		if code == '':
			redirect (fail)
		response = requests.post(
			url,
			headers={'Content-Type': 'application/json'},
       	 	json={'grant_type': 'authorization_code','client_id':clientid,'client_secret':secret, 'code':code, 'redirect_uri': redirect_uri}
		)
		data = json.loads(response.content)
		token = data.get("access_token", "")
		print("token:")
		print(token)
		if token == "":
			redirect (fail)

		url_info = 'https://api.intra.42.fr/v2/me'
		headers = {
            		"Authorization": "Bearer " + token,
            		'Content-Type': 'application/json'
       	}

		response = requests.get(url_info, headers=headers)
		data_user = json.loads(response.content)
		username = data_user.get("login", "")
		useremail = data_user.get("email", "")
		if username == "" or useremail == "":
			return redirect(fail)
		print ("username:")
		print (username)
		print ("useremail:")
		print (useremail)
		try:
			user = User.objects.get(username=username)
			print("User exist")
		except User.DoesNotExist:
			new_password =  get_random_string(42)
			user = User.objects.create_user(useremail, username, new_password, get_unique_public_username(username))
			user.save()
			print("Creating user")
		print("USER LOGGED IN")
		login(request, user)
		return redirect (index)
	return redirect(fail)

def get_unique_public_username(username):
	while(1):
		try:
			user = User.objects.get(public_username=username)
			username = username + get_random_string(2)
		except User.DoesNotExist:
			return username
