//
var id = 0;

var player_id = undefined;
var socket;
var data_received;
var player_name;
var opps_name;


if (tournament.mode == true)
{
	document.getElementById('pre-game-menu').hidden = false;
	clickOpenSocket();
}
else
{
	document.getElementById('pong-main-menu').hidden = false;
	displayBackNavbar();
	// document.getElementById('play-interface').hidden = false;
	// createPreGameBtn({
	// 	btnClass: "btn-leave-matchmaking",
	// 	iconClass: "fa-xmark",
	// 	text: "LEAVE",
	// 	onclickFunc: 'console.log("handle_leave")',
	// 	id: 'footer-game-interface'
	// });

}

function wsIsOpen(ws) {
	if (ws == undefined) {
		return (false)
	}
	return (
		ws.readyState === ws.OPEN
		&& ws.readyState != ws.CLOSING
		&& ws.readyState != ws.CLOSED
	)
}
// var a = 10;
function sendToSocket(data) {
	// a ++;
	// }
	// else{
		let jString = JSON.stringify(data);
		socket.send(jString);
	// }
}


async function clickOpenSocket(){
	player_name = undefined;
	opps_name = undefined;
	player_id = undefined;
	room_name = "";
	if (tournament.mode == true &&  tournament.started_match == false){
		room_name = "/" + tournament.match_id;
		// make sure tournament match_id dont interfer with normal matchmaking
		tournament.started_match = true;

	}
	socket = new WebSocket(document.querySelector('meta[name="websocket"]').content + "/pong" + room_name);
	tournament.socket_match_was_opened = true;

	socket.addEventListener("message", async (event) => {
		let data = JSON.parse(event.data);
		data = data.message;
		if (data.status != 'moving')
		{
		}

		if (tournament.mode == true){
			// console.log("**********************************0000000000000000000000");
			// console.log(tournament.whoami);
			// console.log(tournament.player1_name);
			if (tournament.whoami == tournament.player1_name){
				player_id = 1;
			}
			else{
				player_id = 2;
			}
		}
		else if (player_id == undefined)
		{
			player_id = data.player_id;
			handleWaitingRoom(tournament.mode);
		}

		if (data.status == 'moving')
		{
			if (data.player_id != player_id)
			{
				if (player_id == 1)
				{
					player2.position.x = data.player_pos_x;
					BB_player2.copy( player2.geometry.boundingBox ).applyMatrix4( player2.matrixWorld );
				}
				else
				{
					player1.position.x = data.player_pos_x;
					BB_player1.copy( player1.geometry.boundingBox ).applyMatrix4( player1.matrixWorld );

					let b_pos = data.pb_position;
					let b_rot = data.pb_rotation;
					pongBall.position.set(b_pos.x, b_pos.y, b_pos.z);
					pongBall.rotation.set(b_rot.x, b_rot.y, b_rot.z);

					rvalue = data.rvalue;
				}
			}
			update3DpongBall();
			// dataSender = data.player_id;
			// oppsPosX = data.x;
			// oppsKey['d'] = data.key.d;
			// oppsKey['a'] = data.key.a;
		}

		if (data.status == 'ready-to-start')
		{
			readyState += 1;
		}

		if (data.status == 'goal-score')
		{
			ballVelocity = defaultBallVelocity;
			if (data.who_scored == 1)
			{
				pongBall.rotation.set(0, 90, 0);
				pongBall.position.set(0, 1, 10);
			}
			else
			{
				pongBall.rotation.set(0, -90, 0);
				pongBall.position.set(0, 1, -10);
			}

			score_player_1 = data.score_player_1;
			score_player_2 = data.score_player_2;

			if (player_id == 1)
			{
				document.getElementById('player-left').innerHTML = score_player_1;
				document.getElementById('player-right').innerHTML = score_player_2;
			}
			else
			{
				document.getElementById('player-left').innerHTML = score_player_2;
				document.getElementById('player-right').innerHTML = score_player_1;
			}
			if (score_player_1 == maxGoal || score_player_2 == maxGoal)
			{
				if (score_player_1 == maxGoal && player_id == 1)
				{
					sendToSocket({
						'status': 'end-game',
						'reason': 'score',
						'winner': 1,
						'win_score': score_player_1,
						'loser_score': score_player_2
					})
				}
				else if (score_player_2 == maxGoal && player_id == 2)
				{
					sendToSocket({
						'status': 'end-game',
						'reason': 'score',
						'winner': 2,
						'win_score': score_player_2,
						'loser_score': score_player_1
					})
				}
			}
		}

		if (data.status == 'disconnect')
		{
			if (tournament.mode == true
				|| playerIsPlaying && (data.reason == "refresh" || data.reason == "changing-tab"))
			{
				if (data.dataSender != player_id)
				{
					sendToSocket({
						'status': 'end-game',
						'reason': 'rage-quit',
						'winner': player_id,
						'win_score': player_id == 1 ? score_player_1 : score_player_2,
						'loser_score': player_id == 1 ? score_player_2 : score_player_1
					});
					var obj = new Object();
					obj.status = "result";
					obj.match_id = tournament.match_id;
					var jsonString= JSON.stringify(obj);
					if (tournament.mode == true) {
						tournament.socket_tournament.send(jsonString);
					}
				}
			}
			else
			{
				displayModalDisconnect(data.dataSender);
				sendToSocket({
					'status': 'leave-lobby',
				});
			}
			await goBackTournament(data);
		}
		if (data.status == 'timeout')
		{
			displayTimeoutModal();
			leaveGame();
			await goBackTournament(data);
		}

		if (data.status == 'run-game')
		{
			isLauching = true;
			gameIsRunning = false;
			player_name = player_id == 1 ? data.player1 : data.player2;
			if (tournament.mode == false){
				opps_name = player_id == 1 ? data.player2 : data.player1;
			}
			else{
				opps_name = tournament.whoami == data.player1 ? data.player2 : data.player1;
			}
			runningGame();
		}

		if (data.status == 'leave-lobby')
		{
			leaveGame();
			await goBackTournament(data);
		}

		if (data.status == 'end-game')
		{
			if (data.reason == 'rage-quit')
			{
				displayRagequit(data);
			}
			if (data.reason == 'score')
			{
				displayEndgame(data);
			}
			if (data.reason == 'timeout')
			{
				displayTimeoutTournament(data);
			}
			leaveGame();
			await goBackTournament(data);
		}
	});
}
async function goBackTournament(data){
	if (tournament.mode == true){
		destroyEnvironment();
		tournament.state = "start";
		if (tournament.socket_tournament != null && tournament.socket_tournament.readyState === WebSocket.OPEN
			&& tournament.result_sent == false && tournament.save_player_id == 1){
			var obj = new Object();
			obj.status = "result";
			obj.match_id = tournament.match_id;
			var jsonString= JSON.stringify(obj);
			tournament.socket_tournament.send(jsonString);
			tournament.result_sent = true;
		}
		else{
			var obj = new Object();
			obj.status = "dump";
			obj.match_id = tournament.match_id;
			var jsonString= JSON.stringify(obj);
			tournament.socket_tournament.send(jsonString);
			tournament.result_sent = true;
		}
		urlRoute('/tournament');
	}
}

// function clickCloseSocket() {
// 	sendToSocket({
// 		'status': 'leave-lobby'
// 	})
// }
