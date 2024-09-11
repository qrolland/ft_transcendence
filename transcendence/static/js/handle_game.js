
// ##############################################
// #                USEFUL CONST                #
// ##############################################
var mainDiv = document.getElementById('main');

var ballRadius = 1;

var maxVelocity = 3;
var defaultBallVelocity = 0.4;

var playerVelocity = 1;
var playerWidth = 8;
var playerHeight = 2;
var playerDepth = 0.5;

var player1_mouv = 0;
var player2_mouv = 0;

var maxGoal = 3;

var is_stop = false;
// ##############################################
// #                USEFUL GLOBAL               #
// ##############################################

var gameCanvaIsRunning = false;

// Scene
var renderer;
var scene;
var camera;

// Light
var topLight;

// Bounding Box
var BB_borderLeft;
var BB_borderRight;

var BB_player1Goal;
var BB_player2Goal;

var BB_pongBall;

var BB_player1;
var BB_player2;

// Goal
var player1Goal;
var player2Goal;

// Ball
var pongBall;
var ballVelocity;
var rvalue;

// Players
var player1;
var player2;

var player_1_color;
var player_2_color;

// Score
var score_player_1 = 0;
var score_player_2 = 0;

// Camera
var x;
var y;
var z;
var radius;
var frame;
var camSpeed;

// Intervals
var compteurIntervalID;
var keydownIntervalID;
var runGameIntervalID;
var sendPlayerPosIntervalID;


var FRAME_PER_SECOND = 1000 / 100;

// Timeout
var runningGameTimeout;

var gameRequestAnimation;
var TIMEOUT_gameLoop;

// State
var readyState; // Need == 2 to run
var playerIsPlaying;

// Key input
var pressedKey = {};
var oppsKey = {};


var dataSender;
var oppsPosX;

var TO_goPlayerView;
var TO_turnArroundCamera;


function sendPlayerPos() {
	sendToSocket({
		'status': 'moving',
		'player_id': player_id,
		'player_pos_x': player_id == 1 ? player1.position.x : player2.position.x,
		'key': {
			'a': isPressed('a'),
			'd': isPressed('d'),
		},
		'pb_position': {
			'x': pongBall.position.x,
			'y': pongBall.position.y,
			'z': pongBall.position.z,
		},
		'pb_rotation': {
			'x': pongBall.rotation.x,
			'y': pongBall.rotation.y,
			'z': pongBall.rotation.z,
		},
		'rvalue': rvalue,
		'ballVelocity': player_id == 1 ? ballVelocity : undefined
	});
}

// function update3Dplayer() {
// 	m3D_player_1.position.set(
// 		player1.position.x,
// 		player1.position.y,
// 		player1.position.z,
// 	)
// 	m3D_player_2.position.set(
// 		player2.position.x,
// 		player2.position.y,
// 		player2.position.z,
// 	)
// }

function animate() {
	if (is_stop)
		return ;
	BB_player1.copy( player1.geometry.boundingBox ).applyMatrix4( player1.matrixWorld );
	BB_player2.copy( player2.geometry.boundingBox ).applyMatrix4( player2.matrixWorld );
	BB_player1Goal.copy( player1Goal.geometry.boundingBox ).applyMatrix4( player1Goal.matrixWorld );
	BB_player2Goal.copy( player2Goal.geometry.boundingBox ).applyMatrix4( player2Goal.matrixWorld );

	if (player_id == 1)
	{
		rvalue = moveForward(
			pongBall,
			BB_pongBall,
			ballVelocity,
			BB_player1Goal,
			BB_player2Goal,
			BB_borderLeft,
			BB_borderRight,
			BB_player1,
			BB_player2
		)
	}

	if (rvalue >= 0)
	{
		if (ballVelocity < maxVelocity)
			ballVelocity += rvalue;
	}
	else
	{
		ballVelocity = defaultBallVelocity;
	}

	if (player1_mouv < 0) {
		if (can_mouv_to("right", BB_borderLeft, BB_borderRight, BB_player1))
		{
			player1.position.x += 0.7;
		}
		player1_mouv++;
	}
	else if (player1_mouv > 0) {
		if (can_mouv_to("left", BB_borderLeft, BB_borderRight, BB_player1))
		{
			player1.position.x -= 0.7;
		}
		player1_mouv--;
	}

	if (player2_mouv < 0) {
		if (can_mouv_to("right", BB_borderLeft, BB_borderRight, BB_player2))
		{
			player2.position.x += 0.7;
		}
		player2_mouv++;
	}
	else if (player2_mouv > 0) {
		if (can_mouv_to("left", BB_borderLeft, BB_borderRight, BB_player2))
		{
			player2.position.x -= 0.7;
		}
		player2_mouv--;
	}
}
// ##############################################
// #                HANDLE MOVES                #
// ##############################################

onkeydown = onkeyup = function(event) {
	pressedKey[event.key] = event.type == 'keydown';
}

function isPressed(value) {
	return (pressedKey[value] == true);
}

function oppsPressed(value) {
	return (oppsKey[value] == true);
}


var tick = 0;

function keydown() {
	if (0 < tick && tick <= 60)
		tick++;
	if (player_id == 1)
	{
		let keyPressed = {
			'd': isPressed('d'),
			'a': isPressed('a'),
		}
		if (isPressed('d')) {
			player1_mouv = -playerVelocity;
		}
		if (isPressed('a')) {
			player1_mouv = playerVelocity;
		}
	}
	else if (player_id == 2)
	{
		let keyPressed = {
			'd': isPressed('d'),
			'a': isPressed('a'),
		}
		if (isPressed('d')) {
			player2_mouv = playerVelocity;
		}
		if (isPressed('a')) {
			player2_mouv = -playerVelocity;
		}
	}
}

function handleVisibilityChange() {
	if (document.hidden) {
		sendToSocket({
			'status': 'disconnect',
			'reason': 'changing-tab',
			'dataSender': player_id
		});
	}
}

function runGame() {
	if (isOfflineGame == false && readyState < 2)
	{
		runningGameTimeout += 0.01;
		if (runningGameTimeout >= 10)
		{
			if (tournament.mode == true)
			{
				sendToSocket({
				'status': 'end-game',
				'reason': 'timeout',
				'winner': player_id,
				'win_score': player_id == 1 ? score_player_1 : score_player_2,
				'loser_score': player_id == 1 ? score_player_2 : score_player_1
			});
			}
			else
			{
				sendToSocket({
					'status': 'timeout',
				});
			}
			clearInterval(runGameIntervalID);
		}
		return ;

	}
	if (isOfflineGame == false && player_id == 1)
	{
		sendToSocket({
			'status': 'create-match'
		})
	}
	clearInterval(runGameIntervalID);
	if (isOfflineGame == false)
	{
		keydownIntervalID = setInterval(function() { keydown(); }, 10);
	}
	else
	{
		keydownIntervalID = setInterval(function() { offlineKeydown(); }, 10);
	}
	document.addEventListener('visibilitychange', handleVisibilityChange);
	playerIsPlaying = true;
	if (isOfflineGame == false) {
		sendPlayerPosIntervalID = setInterval(sendPlayerPos, 1);
	}
}

function gameAnimateLoop() {
	if (showFPS){
		stats.begin();
	}
	TIMEOUT_gameLoop = setTimeout(() => {
		gameRequestAnimation = requestAnimationFrame(gameAnimateLoop);
	}, FRAME_PER_SECOND );
	TWEEN.update();
	if (playerIsPlaying) {
		animate();
	}
	if (isOfflineGame) {
		if (score_player_1 == maxGoal) {
			displayEndOfflineGame(1, offlineNbPlayer == 1);
			if (offlineNbPlayer == 1) {
				sendWinnerOffline("human","ai", score_player_1, score_player_2);
			} else {
				sendWinnerOffline("human","invited", score_player_1, score_player_2);
			}
			leaveGame();
		} else if (score_player_2 == maxGoal) {
			displayEndOfflineGame(2, offlineNbPlayer == 1);
			if (offlineNbPlayer == 1) {
				sendWinnerOffline("ai","human", score_player_2, score_player_1);
			} else {
				sendWinnerOffline("invited","human", score_player_2, score_player_1);
			}
			leaveGame();
		}
	}
	if (renderer != undefined) {
		renderer.render(scene, camera);
	}
	if (showFPS){
		stats.end();
	}
}


var TWEEN_1_DURATION = 1000 * 3.5;
var TWEEN_2_DURATION = 1000 * 2.5;
var TWEEN_3_DURATION = 1000 * 3.5;

function runPongAnimation() {
	var launchTween1 = true;
	var launchTween2 = true;
	var launchTween3 = true;
	const tween_animation_1 = new TWEEN.Tween({ t_frame: 0 })
	.to({ t_frame: 3.1 }, TWEEN_1_DURATION)
	.onUpdate((params) => {
		try {
			x = radius * Math.cos(params.t_frame);
			z = radius * Math.sin(params.t_frame);
			camera.position.set(x, y, z);
			camera.lookAt(scene.position);
		} catch (error) {
			tween_animation_1.stop();
			launchTween1 = false;
		}
	}
	);



	const tween_animation_2 = new TWEEN.Tween({ tween_z: player_id == 1 ? 50 : -50, tween_y: 40 })
	.to({ tween_z: 0, tween_y: 60 }, TWEEN_2_DURATION)
	// .easing(TWEEN.Easing.Quadratic.Out)
	.onUpdate((params) => {
		try {
			y = params.tween_y;
			z = params.tween_z;
			camera.position.set(x, y, z);
			camera.lookAt(scene.position);
		} catch (error) {

			tween_animation_2.stop();
			launchTween2 = false;
		}
	});


	const tween_animation_3 = new TWEEN.Tween({ tween_z: player_id == 1 ? 120 : -120 })
	.to({ tween_z: player_id == 1 ? 50 : -50 }, TWEEN_3_DURATION)
	.easing(TWEEN.Easing.Quadratic.Out)
	.onUpdate((params) => {
		try {
			z = params.tween_z;
			camera.position.set(x, y, z);
			camera.lookAt(scene.position);
		} catch (error) {
			tween_animation_3.stop();
			launchTween3 = false;
		}
	});



	tween_animation_1.start();
	tween_animation_1.onComplete(() => {
		if (launchTween1) {
			x = 0;
			y = 40;
			tween_animation_2.start();
		}
	});

	tween_animation_2.onComplete(() => {
		if (launchTween2) {
			y = 30;
			tween_animation_3.start();
		}
	});

	tween_animation_3.onComplete(() => {
		if (launchTween3) {
			runningGameTimeout = 0;
			if (isOfflineGame == false) {
				sendToSocket({
					"status": 'ready-to-start',
					"player_id": player_id,
				});
			}
			runGameIntervalID = setInterval(runGame, 1);
		}
	});
}



// ##############################################
// #                GAME FUNCTION               #
// ##############################################

async function playGame(p_id, isAnOfflineGame, nbPlayers) {
	isOfflineGame = isAnOfflineGame;
	offlineNbPlayer = nbPlayers;
	displayPlayMenu();
	player_id = p_id;


	playerIsPlaying = false;
	gameCanvaIsRunning = true;
	player_id = p_id;
	initEnvironment();
	window.addEventListener('resize', updateCanvas);
	updateCanvas();

	if (isOfflineGame) {
		readyState = 2;
	} else {
		readyState = 0;
	}
	if (player_id == 1) {
		radius = 70;
	}
	else if (player_id == 2) {
		radius = -70;
	}
	else {
		radius = 50;
	}
	camera.position.set(x, y, z);

	runPongAnimation();
	gameAnimateLoop();

}

function leaveGame() {
	destroyEnvironment();
	tournament.save_player_id = player_id;
	player_id = undefined;
	if (isOfflineGame == true) {
		isOfflineGame = false;
		if (tournament.mode == false){
			urlRoute('/ponggame');
		}
	} else {
		if (wsIsOpen(socket))
		{
			socket.close();
		}
		if (tournament.mode == false){
			handleLeaveMatchmaking();
		}
	}
}

// ##############################################
// #                HANDLE CANVAS               #
// ##############################################
function updateCanvas() {
	camera.aspect = (mainDiv.offsetWidth - 200) / (mainDiv.offsetHeight - 220);
	camera.updateProjectionMatrix();
	renderer.setSize( mainDiv.offsetWidth - 200, mainDiv.offsetHeight - 220 );
}

async function sendWinnerOffline(winner, loser, score_winner, score_loser){
	var obj = new Object;
	obj.winner = winner;
	obj.loser = loser;
	obj.loser_score = score_loser;
	obj.winner_score = score_winner;
	var jsonString = JSON.stringify(obj);
	var url = getBaseUrl()  + "/pong_game_ai";
	var response = await fetch(url,{
		method: "POST",
		credentials: 'same-origin',
		headers: {'Content-Type':  	' /json', 'X-CSRFToken' : readCookie('csrftoken')},
		body: jsonString
	})
}


function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
    }
