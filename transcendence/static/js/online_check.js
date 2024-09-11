var onlineWebSocket;
var watchWebSocket;
var base_ws= document.querySelector('meta[name="websocket"]').content;

var sleep = ms => new Promise(r => setTimeout(r, ms));

online_websocket();

async function online_websocket(){
	if (onlineWebSocket != undefined && onlineWebSocket.readyState === WebSocket.OPEN)
		return;

	onlineWebSocket = new WebSocket(base_ws + "/online_check");
	onlineWebSocket.addEventListener("message", async (event) => {
		// console.log("Message from server online ", event.data);
		message = JSON.parse(event.data);
		if (message["query_type"] == "friends_status"){
			friends_status(message["payload"]);
		}
		else if (message["query_type"] == "match_list"){
			show_match_list_tv(message["payload"]);
		}
		else if (message["query_type"] == "tournament_list"){
			showTournamentList(message["payload"]);
		}
	});
}

var delay = 5 * 1000;
setInterval(update_friend_status, delay);
setInterval(update_match_list_tv, delay);
setInterval(update_tournament_list, delay);


async function update_tournament_list(){

	if (window.location.pathname == "/tournament/" || window.location.pathname == "/tournament"){
		if (document.getElementById("tournament_list_wrapper").style.display == "none")
			return;
		var obj = new Object();
		obj.query_type = "tournament_list";
		var jsonString= JSON.stringify(obj);
		onlineWebSocket.send(jsonString);
	}
}

async function update_match_list_tv(){
	if (window.location.pathname == "/tv/" || window.location.pathname == "/tv"){
		var obj = new Object();
		obj.query_type = "match_list";
		var jsonString= JSON.stringify(obj);
		onlineWebSocket.send(jsonString);
	}
}

async function update_friend_status(){
	if (window.location.pathname == "/profile/" || window.location.pathname == "/profile"){
		var obj = new Object();
		obj.query_type = "friends_status";
		var jsonString= JSON.stringify(obj);
		onlineWebSocket.send(jsonString);
	}
}

function show_match_list_tv(match_list){
	var str = "";
	var div = document.getElementById("match_list");
	div.innerHTML = '';

	for (var i = 0; i < match_list.length; i++){
		let matchBlock = document.createElement('div');
		matchBlock.classList.add('match-block');
		matchBlock.id = match_list[i]["match_id"].toString();
		let matchInfo = {
			player1_name: match_list[i]["Player1_name"],
			player2_name: match_list[i]["Player2_name"],
			current_score_p1: match_list[i]["current_score_player_1"].toString(),
			current_score_p2: match_list[i]["current_score_player_2"].toString(),
		};
		let strMatchInfo = JSON.stringify(matchInfo);
		matchBlock.setAttribute('onclick', 'watchMatch(this.id,' + strMatchInfo + ')');

		let divP1name = document.createElement('div');
		divP1name.innerHTML = match_list[i]["Player1_name"];

		let divScoreP1 = document.createElement('div');
		divScoreP1.innerHTML = match_list[i]["current_score_player_1"].toString();

		let divTild = document.createElement('div');
		divTild.innerHTML = '-';

		let divScoreP2 = document.createElement('div');
		divScoreP2.innerHTML = match_list[i]["current_score_player_2"].toString();

		let divP2name = document.createElement('div');
		divP2name.innerHTML = match_list[i]["Player2_name"];

		matchBlock.append(divP1name, divScoreP1, divTild, divScoreP2, divP2name);
		div.append(matchBlock);
	}
	// div.innerHTML = str;
}

function watchMatch(id, strMatchInfo){
	document.getElementById("tv-player-1").innerHTML = strMatchInfo.player1_name;
	document.getElementById("tv-player-2").innerHTML = strMatchInfo.player2_name;
	document.getElementById("tv-score-p1").innerHTML = strMatchInfo.current_score_p1;
	document.getElementById("tv-score-p2").innerHTML = strMatchInfo.current_score_p2;
	var match_id = id;
	if (watchWebSocket != undefined &&  watchWebSocket.readyState === WebSocket.OPEN){
		watchWebSocket.close();
	}
	watchWebSocket = new WebSocket(base_ws + "/watch/" + match_id);
	watchWebSocket.addEventListener("message", async (event) => {
		let data = JSON.parse(event.data);
		data = data.message;

		update_TV(data);
	})
}


function update_TV(data){
	if (data.status == 'moving') {
		if (data.player_id == 1) {
			TVplayer1.position.x = data.player_pos_x;
		}
		else
		{
			TVplayer2.position.x = data.player_pos_x;
		}
		let b_pos = data.pb_position;
		let b_rot = data.pb_rotation;
		TVpongBall.position.set(b_pos.x, b_pos.y, b_pos.z);
		TVpongBall.rotation.set(b_rot.x, b_rot.y, b_rot.z);

		if (data.ballVelocity != undefined) {
			TVvelocity = data.ballVelocity;
		}
		update3DTVpongBall(TVvelocity);
	}
	if (data.status == 'goal-score') {
		document.getElementById("tv-score-p1").innerHTML = data.score_player_1;
		document.getElementById("tv-score-p2").innerHTML = data.score_player_2;
	}
	if (data.status == 'end-game' || data.status == 'disconnect') {
		restoreDefaultTV();
	}
}

function friends_status(friend_status){
	for (var i = 0; i < friend_status.length; i++){
		var username = friend_status[i]["username"] ;
		if (document.getElementById(username) == undefined) {
			return ;
		}
		var div = document.getElementById(username).childNodes;
		if (friend_status[i]["is_playing"] == true){
			div[5].innerText = "Playing";
			div[7].style.color = " rgb(224, 238, 144)";
		}
		else if (friend_status[i]["is_online"] == true){
			div[5].innerText = "Online";
			div[7].style.color = "lightgreen";
		}
		else{
			div[5].innerText = "Offline";
			div[7].style.color = "lightcoral";

		}
	}
}
