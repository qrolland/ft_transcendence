var infoModalHTML = document.getElementById('infoModal');
var modalIcone = document.getElementById('modalIcone');
var infoModalTitle = document.getElementById('infoModalLabel');

var bodyModalContent = document.getElementById('bodyModalContent');

var infoModal = new bootstrap.Modal('#infoModal', {keyboard: false});

var btn1 = document.getElementById('modal-btn-1');
var btn2 = document.getElementById('modal-btn-2');


function replaceIcon(new_icon) {
	modalIcone.className = 'fa-solid ' + new_icon;
}

function replaceTitle(new_title) {
	infoModalTitle.innerHTML = new_title;
}

function replaceInfoText(new_content) {
	bodyModalContent.innerHTML = '<h1 id="info-modal-text"></h1>';
	let infoText = document.getElementById('info-modal-text');
	infoText.innerHTML = new_content;
}

function replaceModalContent(new_content) {
	bodyModalContent.innerHTML = new_content;
}

function changeBtnStyle(btn, new_class) {
	btn.className = new_class;
}

function changeBtnAction(btn, func) {
	btn.onclick = func;
}

// function addContent() {

// }

function hideButtonNum2() {
	document.getElementById("col-block-1").style.display = 'none';
	document.getElementById("col-block-2").style.display = 'none';
	document.getElementById("col-block-3").style.display = 'none';
	document.getElementById("modal-btn-2").style.display = 'none';
	document.getElementById("modal-btn-2").style.display = 'none';
}

function displayButtonNum2() {
	document.getElementById("col-block-1").style.display = 'block';
	document.getElementById("col-block-2").style.display = 'block';
	document.getElementById("col-block-3").style.display = 'block';
	document.getElementById("modal-btn-2").style.display = 'block';
}


function displayModalDisconnect(dataSender) {
	hideButtonNum2();
	replaceTitle("Game finished");
	replaceIcon('fa-circle-info');
	if (dataSender == player_id)
	{
		replaceInfoText("You have been disconnected...");
	}
	else
	{
		replaceInfoText("The opponent has been disconnected...");
	}
	infoModal.show(infoModalHTML);
}

function displayTimeoutModal() {
	hideButtonNum2();
	replaceTitle("Timeout");
	replaceIcon('fa-stopwatch');
	replaceInfoText("The connection with the opponent has been lost... Back to the lobby.");
	infoModal.show(infoModalHTML);
}

function displayRagequit(data) {
	hideButtonNum2();
	if (data.winner == player_id)
	{

		replaceIcon('fa-trophy');
		replaceTitle("Victory");
		replaceInfoText(opps_name + " gave in to the pressure and left the game... So you come out a winner !");
	}
	else
	{
		replaceIcon('fa-circle-xmark');
		replaceTitle("Defeat");
		replaceInfoText("You have left the game... " + opps_name + " comes out a winner !");
	}
	infoModal.show(infoModalHTML);
}

function displayEndOfflineGame(player_id, isIA) {
	hideButtonNum2();
	if (isIA == true) {
		if (player_id == 1) {
			replaceIcon('fa-trophy');
			replaceTitle("Victory");
			replaceModalContent('\
				<h1>AI isn\'t going to replace you today... You\'ve won !</h1>\
				<h1>Final score</h1>\
				<div class="row">\
				<div class="col"></div>\
				<h1 class="col-1" style="color: green;">' + score_player_1 +'</h1>\
				<h1 class="col-1" style="color: black;"> - </h1>\
				<h1 class="col-1" style="color: red;">' + score_player_2 +'</h1>\
				<div class="col"></div>\
				</div>\
			');
		} else {
			replaceIcon('fa-circle-xmark');
			replaceTitle("Defeat");
			replaceModalContent('\
			<h1>You lost against a bot? Seriously? !</h1>\
			<h1>Final score</h1>\
			<div class="row">\
			<div class="col"></div>\
			<h1 class="col-1" style="color: green;">' + score_player_1 +'</h1>\
			<h1 class="col-1" style="color: black;"> - </h1>\
			<h1 class="col-1" style="color: red;">' + score_player_2 +'</h1>\
			<div class="col"></div>\
			</div>\
		');
		}
	} else {
		replaceTitle("Game finished");
		replaceIcon('fa-circle-info');
		if (player_id == 1) {
			replaceModalContent('\
				<h1>Player 1 wins this game !</h1>\
				<h1>Final score</h1>\
				<div class="row">\
				<div class="col"></div>\
				<h1 class="col-1" style="color: green;">' + score_player_1 +'</h1>\
				<h1 class="col-1" style="color: black;"> - </h1>\
				<h1 class="col-1" style="color: red;">' + score_player_2 +'</h1>\
				<div class="col"></div>\
				</div>\
			');
		} else {
			replaceModalContent('\
			<h1>Player 2 wins this game !</h1>\
			<h1>Final score</h1>\
			<div class="row">\
			<div class="col"></div>\
			<h1 class="col-1" style="color: green;">' + score_player_1 +'</h1>\
			<h1 class="col-1" style="color: black;"> - </h1>\
			<h1 class="col-1" style="color: red;">' + score_player_2 +'</h1>\
			<div class="col"></div>\
			</div>\
		');
		}
	}
	infoModal.show(infoModalHTML);
}

function displayEndgame(data) {
	hideButtonNum2();
	replaceTitle("Game finished");
	replaceIcon('fa-circle-info');

	if (data.winner == player_id)
	{
		replaceIcon('fa-trophy');
		replaceTitle("Victory");
		replaceModalContent('\
			<h1>You won the game against ' + opps_name + ' !</h1>\
			<h1>Final score</h1>\
			<div class="row">\
			<div class="col"></div>\
			<h1 class="col-1" style="color: green;">' + data.win_score +'</h1>\
			<h1 class="col-1" style="color: black;"> - </h1>\
			<h1 class="col-1" style="color: red;">' + data.loser_score +'</h1>\
			<div class="col"></div>\
			</div>\
		');
	}
	else
	{
		replaceIcon('fa-circle-xmark');
		replaceTitle("Defeat");
		replaceModalContent('\
		<h1>You lost the game against ' + opps_name + ' !</h1>\
		<h1>Final score</h1>\
		<div class="row">\
		<div class="col"></div>\
		<h1 class="col-1" style="color: red;">' + data.loser_score +'</h1>\
		<h1 class="col-1" style="color: black;"> - </h1>\
		<h1 class="col-1" style="color: green;">' + data.win_score +'</h1>\
		<div class="col"></div>\
		</div>\
	');
	}
	infoModal.show(infoModalHTML);
}

function displayTimeoutTournament(data) {
	hideButtonNum2();
	if (data.winner == player_id)
	{
		replaceIcon('fa-trophy');
		replaceTitle("Victory");
		replaceInfoText(opps_name + " didn't connect in time... You won the game!");
	}
	else
	{
		replaceIcon('fa-circle-xmark');
		replaceTitle("Defeat");
		replaceInfoText("You didn't connect in time... You lost the game!");
	}
	infoModal.show(infoModalHTML);
}



function HideModalTimeout(time){
	const id = setTimeout(function() {	infoModal.hide(); }, time);
}

function displayModalAdminLeft(){
	replaceTitle("Tournament admin left :( Shame on him");
	replaceIcon("fa-solid fa-thumbs-down");

	replaceInfoText(" ");
	hideButtonNum2();
	infoModal.show(infoModalHTML);
	HideModalTimeout(5000);
}
