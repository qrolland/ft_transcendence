var player_id = undefined;
var socket = undefined;
var data_received;
// let isMyTurn = false;
var compteur = 3;
var intervalID;

function startTimer() {
	if (compteur === 0) {
		compteur = 3;
		clearInterval(intervalID);
		document.getElementById("div-timer-running").style.display = 'none';
		start(player_id);
	} else {
		window.addEventListener('unload', function(event) {
			clickCloseSocket();
		});
		window.addEventListener('popstate', function() {
			clickCloseSocket();
		});
		// socket.addEventListener("message", (event) => {
		// 	let data = JSON.parse(event.data);
		// 	data = data.message;
		// 	if (data.status == 'player-left'){
		// 		opponent_left=true;
		// 	}
		// });
		document.getElementById('timer-running').innerHTML = compteur;
		compteur--;
	}
}

function runningGame() {
	document.getElementById("socket-waiting").style.display = 'none';
	document.getElementById("left-btn").style.display = 'none';
	document.getElementById("log-player-info").style.display = 'none';
	document.getElementById("div-timer-running").style.display = 'block';
	intervalID = setInterval(startTimer, 1000);
}

function clickOpenSocket(){
	document.getElementById("log-player-info").style.display = 'block';
	document.getElementById("socket-waiting").style.display = "block";
	document.getElementById("left-btn").style.display = 'inline-block';
    document.getElementById("div-timer-running").style.display = 'none';
	matchmakingMode = true;
	// CLUSTERS
	// socket = new WebSocket("wss://bess-f4r2s4:8888");
	// LOCALHOST
	socket = new WebSocket(getBaseWss() + "/ws/game");

	socket.addEventListener("message", (event) => {
		let data = JSON.parse(event.data);
		data = data.message;
		if (data.status == 'player-left'){
			opponent_left=true;
		}
		if (player_id == undefined){
			player_id = data.player_id;
			document.getElementById("log-as-id").innerHTML = "Log in as player " + player_id;
		}
		if (data.status == 'run-game'){
			runningGame();
		}
		if (data.status == 'leave-lobby'){
			clickCloseSocket();
		}
	});
}

function clickCloseSocket(){
	displayNavbar();
	if (matchmakingMode) {
		opponent_left = true;
		document.getElementById("score-message-ttt").style.display = "none";
		document.getElementById("tic-tac-toe-board").style.display ="none";
		document.getElementById("left-btn").style.display = "none";
		document.getElementById("restart-ttt").style.display = "none";
		socket.send(JSON.stringify({ status: 'player-left'}));
		setTimeout(function() {
			socket.close();
			urlRoute('/game');
			displayNavbar();
		}, 500);
	}
	else {
		urlRoute('/game');
		displayNavbar();
	}
}