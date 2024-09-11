var compteur;
var isLauching = false;

function startTimer() {
	if (isLauching == false)
	{
		clearInterval(compteurIntervalID);
		return ;
	}
	if (compteur === 0) {
		compteur = 5;
		clearInterval(compteurIntervalID);
		gameIsRunning = true;
		playGame(player_id, false, null);
	} else {
		if (compteur <= 3 || tournament.mode == true) {
			const compteurDiv = document.createElement('div');
			const compteurh1 = document.createElement('h1');
			compteurh1.textContent = compteur;
			compteurDiv.appendChild(compteurh1);
			document.getElementById("footer-pre-game").innerHTML = '';
			document.getElementById("footer-pre-game").appendChild(compteurDiv);
		}
		compteur--;
	}
}

function runningGame() {
	clearInterval(dotsWaitingIntervalID);
	changeGameSettingsStatus({
		'text': 'You join against',
		'spanText': opps_name
	});
	changeSettingsStyle('game-stgs-find');
	compteur = 4;
	compteurIntervalID = setInterval(startTimer, 1000);
}
