var dotsWaitingIntervalID;
var nbDotsLoading = 1;

function displayGameSelectetion() {

}

function handleLeaveMatchmaking() {
	document.getElementById('pre-game-menu').hidden = false;
	document.getElementById('play-interface').hidden = true;
	displayBackNavbar();
	clearInterval(dotsWaitingIntervalID);
	changeSettingsStyle('game-stgs-default');
	changeGameSettingsStatus({
		'text': 'Pre-game',
	});
	createPreGameBtn({
		btnClass: "btn-find-matchmaking",
		iconClass: "fa-globe",
		text: "FIND A MATCH",
		onclickFunc: "clickOpenSocket();"
	});
}

function threeDotsSearching() {
	let dotsWaiting = '';
	for (let i = 0; i < nbDotsLoading; i++) {
		dotsWaiting += '.';
	}
	nbDotsLoading = nbDotsLoading == 3
	? nbDotsLoading = 1
	: nbDotsLoading + 1;

	if (tournament.mode == true) {
		const dotsDiv = document.createElement('div');
		const dotsh1 = document.createElement('h1');
		dotsh1.textContent = dotsWaiting;
		dotsDiv.appendChild(dotsh1);
		document.getElementById("footer-pre-game").innerHTML = '';
		document.getElementById("footer-pre-game").appendChild(dotsDiv);
	} else {
		changeGameSettingsStatus({
			'text': 'Searching' + dotsWaiting
		});
	}
}

popStateFunction = () => {
	sendToSocket({
		'status': 'disconnect',
		'reason': 'changing-tab',
		'dataSender': player_id
	});
	// Vous pouvez accéder à l'objet state de l'événement pour des détails sur l'état de l'historique
	window.removeEventListener('popstate', popStateFunction);
}

function handleWaitingRoom(tournamentMode) {
	nbDotsLoading = 1;
	hideBackNavbar(false);
	var div_footer = document.getElementById("footer-pre-game");
	div_footer.innerHTML = '';
	changeSettingsStyle('game-stgs-searching');
	threeDotsSearching();
	dotsWaitingIntervalID = setInterval(threeDotsSearching, 1000);
	window.addEventListener('popstate', popStateFunction);
	if (tournamentMode == false)
	{
		createPreGameBtn({
			btnClass: "btn-leave-matchmaking",
			iconClass: "fa-right-from-bracket",
			text: "Leave matchmaking",
			onclickFunc: "\
			sendToSocket({\
				'status': 'leave-lobby'\
			});"
		});
	}
	else
	{
		changeGameSettingsStatus({
			'text': 'Waiting for ',
			'spanText': tournament.whoami == tournament.player1_name
			? tournament.player2_name
			: tournament.player1_name,
		});
	}
}
