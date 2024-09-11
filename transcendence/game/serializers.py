from rest_framework import serializers
from game.models import MyUser, PongRoom, PongMatch,Tournament, TicTacToeGame



class PongRoomSerializer(serializers.ModelSerializer):
	class Meta:
		model = PongRoom
		fields = ['id', 'name', 'nb_user', 'is_full']

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = MyUser
		fields = ['username','public_username', 'is_online', 'is_playing']

		fields = ['public_username', 'username', 'is_online', 'is_playing', 'trust_factor']

class PongMatchSerializer(serializers.Serializer):
	match_id = serializers.CharField(max_length=200)
	Player1_name = serializers.CharField(max_length=200)
	Player2_name = serializers.CharField(max_length=200)
	winner_name = serializers.CharField(max_length=200)
	loser_name = serializers.CharField(max_length=200)
	tournament_level=serializers.IntegerField()
	tournament_id=serializers.CharField()
	tournament_match_id=serializers.IntegerField()
	date = serializers.CharField()
	current_score_player_1 = serializers.IntegerField()
	current_score_player_2 = serializers.IntegerField()
	def create(self, validated_data):
		return PongMatch.objects.create(**validated_data)

class TournamentSerializer(serializers.ModelSerializer):
	player = UserSerializer(read_only=True, many=True)
	admin = UserSerializer(read_only=True)
	match = PongMatchSerializer(read_only=True, many=True)
	winner = UserSerializer(read_only=True)
	admin = UserSerializer(read_only=True)

	class Meta:
		model = Tournament
		fields = ('name', 'nb_player', 'player','match', 'winner', 'admin', 'display_name')


class TicTacToeGameSerializer(serializers.Serializer):

	opponent = UserSerializer(read_only=True)
	player = UserSerializer(read_only=True)
	winner = UserSerializer(read_only=True)
	date = serializers.CharField(max_length=30)
	board = serializers.CharField(max_length=10)
	def create(self, validated_data):
		return TicTacToeGame.objects.create(**validated_data)
