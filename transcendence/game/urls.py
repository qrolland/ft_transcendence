from django.urls import path

from . import views
from django.conf import settings
from django.conf.urls.static import static
from pathlib import Path

handler404 = "game.views.page_not_found_view"

current_dir = Path(__file__).resolve().parent.parent

save_dir = str(current_dir) + "/profile_image/"
urlpatterns = [
	path('tv/', views.index),
	path('tv.html', views.tv_html),
	path("logout.html", views.logout_page),
	path('game.html', views.game_html, name='game'),
	path('game/', views.index),
	path('top.html', views.top_html),
	path('top/', views.index),
	path('profile/', views.index),
	path('profile.html', views.profile_html, name='profile_html'),
	path('settings.html', views.settings_html),
	path('settings/', views.index),
	path('tournament/', views.index),
	path('tournament.html', views.tournament_html),
	path('game/', views.ponggame),
	path('ponggame/', views.index),
	path('ponggame.html', views.ponggame),
    path("fail", views.fail),
	path('home.html', views.home_html),
	path('home/', views.index, name="home"),

	path("accounts/login/", views.login_page),
	path("accounts/login_passwd/", views.login_page_pswd),
	path("passwordlogin", views.password_login),
	path("passwordcreate", views.password_create),
	path("oauthlogin", views.oauthlogin_callback), 
	path("loginoauth", views.loginoauth),

	path('profile_update', views.profile_update),
	path('game_update/', views.game_update),
	path('pong_game_ai', views.pong_game_ai),

	path('remove_friend', views.remove_friend),
	path('settings_update', views.settings_update),
	path('upload_profile_picture', views.upload_picture),
	path('tournamentList', views.getTournamentList),
	path(f'{save_dir[1:]}<str:img_name>', views.get_profile_picture),
	path('whoami', views.whoami),
	path('top/pong/<str:number_user_requested>', views.get_top_pong),
	path('update/username', views.update_username),
	path('user/profile_picture', views.profile_picture),

	path('profile/<str:username>',  views.profile_html),
	path('profile/<str:public_username>/',  views.index),
	path('userexist/<str:username>', views.search_user_exist),
]
