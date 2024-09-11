var defaultDegrees = 0;

function displayPreGameMenu() {
	changeGameSettingsStatus({
		'text': 'Pre-game',
	});
	mainDiv = document.getElementById('main');
	document.getElementById("pre-game-menu").hidden = false;
	document.getElementById("pong-main-menu").hidden = true;
	// document.getElementById("footer-pre-game").innerHTML = '';
}

function handleLeaveButton() {
	if (isOfflineGame == true) {
		leaveGame();
	} else {
		sendToSocket({
			'status': 'disconnect',
			'reason': 'changing-tab',
			'dataSender': player_id
		});
	}
}

function displayPlayMenu() {
	hideBackNavbar(false);
	document.getElementById("pre-game-menu").hidden = true;
	document.getElementById("play-interface").hidden = false;
	createPreGameBtn({
		btnClass: "btn-leave-matchmaking",
		iconClass: "fa-xmark",
		text: "LEAVE",
		onclickFunc: 'handleLeaveButton()',
		id: 'footer-game-interface'
	});
}


function backToDefaultPage() {
	document.getElementById("pong-main-menu").hidden = false;
	document.getElementById("pre-game-menu").hidden = true;
	displayBackNavbar("hideBackNavbar(true);urlRoute('/game');");
}

function changeSettingsStyle(className) {
	document.getElementById('stgs-border').className = className;
}

function changeGameSettingsStatus({text, spanText}) {
	var game_settings_status = document.getElementById("game-settings-status");
	if (game_settings_status == null){
		return;
	}
	game_settings_status.innerHTML = '';
	const newH1 = document.createElement('h1');
	newH1.textContent = text;
	if (spanText != undefined) {
		const newSpan = document.createElement('span');
		newSpan.textContent = spanText;
		newH1.textContent += ' ';
		newH1.append(newSpan);
	}
	game_settings_status.append(newH1);
}

function createPreGameBtn({btnClass, iconClass, text, onclickFunc, id}) {
	var div_footer = document.getElementById(id == undefined ? "footer-pre-game" : id);
	div_footer.innerHTML = '';
	const newButton = document.createElement('button');

	newButton.classList.add("pre-game-btn");
	if (btnClass != true)
	{
		newButton.classList.add(btnClass);
	}
	if (iconClass != true)
	{
		const newIcon = document.createElement('i');
		newIcon.classList.add("fa-solid", iconClass);
		newButton.append(newIcon);
	}
	if (onclickFunc != undefined)
	{
		newButton.setAttribute('onclick', onclickFunc);
	}
	newButton.append(text);
	div_footer.appendChild(newButton);
}

// #############
// # FAST COPY #
// #############
// createPreGameBtn({
// 	btnClass: "",
// 	iconClass: "",
// 	text: "",
// 	onclickFunc: ""
// })

function handleMode(mode) {
	document.getElementById("footer-pre-game").innerHTML = '';
	displayBackNavbar('backToDefaultPage();');

	if (mode == '1_player' || mode == '2_players')
	{
		createPreGameBtn({
			btnClass: "btn-search-game",
			iconClass: "fa-play",
			text: "START",
			onclickFunc: mode == '1_player'
			? 'playGame(1, true, 1);'
			: 'playGame(1, true, 2);'
		});
		displayPreGameMenu();
	}
	else if (mode == 'online')
	{

		createPreGameBtn({
			btnClass: "btn-find-matchmaking",
			iconClass: "fa-globe",
			text: "FIND A MATCH",
			onclickFunc: 'clickOpenSocket()'
		})
		displayPreGameMenu();
	}
	else {
	}
}

function changeModeRotate(direction) {
	var elts = [
		document.querySelector('#selected-mode-carousel .selected-background:nth-child(1)'),
		document.querySelector('#selected-mode-carousel .selected-background:nth-child(2)'),
		document.querySelector('#selected-mode-carousel .selected-background:nth-child(3)'),
		// document.querySelector('#selected-mode-carousel .selected-background:nth-child(4)'),
	]
	const incrementDeg = 360 / elts.length;
	const translateZ = '120px';
	if (direction == 'previous') {
		defaultDegrees += incrementDeg;
	} else if (direction == 'next') {
		defaultDegrees -= incrementDeg;
	} else {
		defaultDegrees = defaultDegrees;
	}
	for (let i = 0; i < elts.length; i++) {
		elts[i].style.transition = '1s';
		elts[i].style.transform = `rotateY(${defaultDegrees + (i * incrementDeg)}deg) translateZ(${translateZ})`;
		elts[i].addEventListener("transitionend", function transitionend(event) {
			if (event.propertyName == 'transform')
			{
				elts[i].style.transition = '.2s';
				elts[i].removeEventListener("transitionend", transitionend);
			}
		});

	}
}

// changeModeRotate('previous');
// handleMode('online');
