from django.urls import path

from . import consumers


websocket_urlpatterns = [
    path(r"", consumers.userConsumer.as_asgi()),
    path(r"watch/<str:watchroom>", consumers.userConsumer.as_asgi()),
    path('ws/game', consumers.GameConsumer.as_asgi()),
#     path(r"pong/<str:pongroom>", consumers.userConsumer.as_asgi()),
	path('online_check', consumers.onlineConsumer.as_asgi()),
    path(r"pong", consumers.userConsumer.as_asgi()),
    path(r"pong/", consumers.userConsumer.as_asgi()),
    path(r"pong/<str:pongroom>", consumers.userConsumer.as_asgi()),

	path(r"tournament", consumers.TournamentConsumer.as_asgi()),
    path(r"tournament/", consumers.TournamentConsumer.as_asgi()),
    path(r"tournament/<str:tournamentroom>", consumers.TournamentConsumer.as_asgi()),
	
 ]