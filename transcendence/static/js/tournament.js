var tournamentModalHTML = document.getElementById('tournamentModal');
var modalIcone = document.getElementById('modalIcone');
var tournamentModalTitle = document.getElementById('tournamentModalTitle');
var tournamentName;



var tournamentModal = new bootstrap.Modal('#tournamentModal', {keyboard: false});

function tournamentButtonCreate() {
	let who_is = document.getElementById('who_is').textContent;
	var inputValue = document.getElementById('slot-1-input').value;
	let tmpTournamentName = inputValue == "" ? (who_is + "'s tournament") : inputValue;
	tournamentModal.hide(tournamentModalHTML);
	// console.log(who_is + " | " + inputValue + " = " + tmpTournamentName);
	tournament.tournament_name = tmpTournamentName;
	tournamentName = tmpTournamentName;
	CreateTournament();
}

function createTournamentModal() {
	tournamentModalTitle.innerHTML = 'Create a tournament';
	document.getElementById('slot-1-input').value = '';
	document.getElementById('slot-1-label').innerHTML = 'Tournament name :';
	document.getElementById('tournamentModalActionButton').innerHTML = 'Create a tournament';
	tournamentModal.show(tournamentModalHTML);
}

// function joinTournamentModal() {
// 	tournamentModalTitle.innerHTML = 'Join a tournament';
// 	document.getElementById('slot-2').hidden = true;
// 	document.getElementById('slot-1-label').innerHTML = 'Your display name :';
// 	document.getElementById('modalActionButton').innerHTML = 'JOIN';
// 	tournamentModal.show(tournamentModalHTML);
// }
