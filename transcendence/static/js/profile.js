

window.addEventListener('load', main ());

var addFriendsForm = document.getElementById('add-friends-form');

// Ajoutez un écouteur d'événements pour l'événement de soumission du formulaire
if (addFriendsForm != null){

	addFriendsForm.addEventListener('submit', function(event) {
		// Empêchez le comportement de soumission du formulaire par défaut
		event.preventDefault();

		// Appelez la fonction sendData() lorsque le formulaire est soumis
		sendData();
	});
}


function hideAllTabs() {
	document.getElementById('profile-stats').style.display = 'none';
	document.getElementById('profile-friends').style.display = 'none';
	document.getElementById('profile-history').style.display = 'none';
}

function displayProfileTab(tab) {
	hideAllTabs();
	if (tab == 'stats') {
		document.getElementById('profile-stats').style.display = 'flex';
		document.getElementById('selector-for-tab-profile').style.transform = 'translate(0%, 0%)';
	} else if (tab == 'friends') {
		try{
			document.getElementById("message").style.opacity = "0";
			document.getElementById("username").value = "";
		}
		catch(error){
			;
		}
		document.getElementById('profile-friends').style.display = 'flex';
		document.getElementById('selector-for-tab-profile').style.transform = 'translate(103%, 0%)';

	} else if (tab == 'history') {
		document.getElementById('profile-history').style.display = 'flex';
		document.getElementById('selector-for-tab-profile').style.transform = 'translate(205%, 0%)';

	}
}

function sendData() {
    var formData = new FormData(document.getElementById('add-friends-form'));
    var crsfcookie = readCookie('csrftoken');
    // Utilisez Fetch pour envoyer les données au serveur
    fetch(getBaseUrl() + "/profile_update", {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-CSRFToken': crsfcookie,
        },
        body: formData, // Utilisez formData comme corps de la requête
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                urlRoute('/profile');
            } else {
                // Affichez un message d'erreur à l'utilisateur
                document.getElementById("message").style.opacity = "1";
                document.getElementById("message").textContent = "We couldn't find any friends with that name.";
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
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

async function main(){



	displayStatGoal("stat_goal_taken", "stat_goal_scored", "goal_taken", "goal_scored");
	displayStatGoal("stat_goal_taken_average", "stat_goal_scored_average", "average_goal_taken", "average_goal");
	displayStatGoal("stat_match_lose", "stat_match_won", "match_lose", "match_won");
	window.onmousemove = function (e) {
		var x = e.clientX ;
        var y = e.clientY ;
		if (document.getElementById("stat_goal_taken") != null){

			document.getElementById("stat_goal_taken").style.top = (y - 80) + 'px';
			document.getElementById("stat_goal_taken").style.left = (x - 80) + 'px';
			document.getElementById("stat_goal_scored").style.top = (y - 80) + 'px';
			document.getElementById("stat_goal_scored").style.left = (x - 80) + 'px';
			document.getElementById("stat_goal_taken_average").style.top = (y - 80) + 'px';
			document.getElementById("stat_goal_taken_average").style.left = (x - 80) + 'px';
			document.getElementById("stat_goal_scored_average").style.top = (y - 80) + 'px';
			document.getElementById("stat_goal_scored_average").style.left = (x - 80) + 'px';
			document.getElementById("stat_match_lose").style.top = (y - 80) + 'px';
			document.getElementById("stat_match_lose").style.left = (x - 80) + 'px';
			document.getElementById("stat_match_won").style.top = (y - 80) + 'px';
			document.getElementById("stat_match_won").style.left = (x - 80) + 'px';
			document.getElementById("trust_factor").style.top = (y - 80) + 'px';
			document.getElementById("trust_factor").style.left = (x - 80) + 'px';
		}

	};
	var trust_factor = parseFloat(document.getElementById("trust_factor").innerText);
	showTrustFactor(trust_factor,"wrapperIcon");
}




function displayStatGoal(stat_taken, stat_scored, stat_taken_value, stat_scored_value){
	var nbGoalTaken = parseFloat (document.getElementById(stat_taken).innerText);
	var nbGoalScored = parseFloat (document.getElementById(stat_scored).innerText);

	var pathGoalTaken = document.getElementById(stat_taken_value);
	var pathGoalScored = document.getElementById(stat_scored_value);
	var lenght_scored = Math.round(nbGoalTaken / (nbGoalScored +nbGoalTaken) * 90);
	var lenght_taken = 90 - Math.round(nbGoalTaken/ (nbGoalScored +nbGoalTaken) * 90) + 2;
	if (nbGoalScored > nbGoalTaken){
		pathGoalTaken.setAttribute("stroke-width", 7);
	}
	else if (nbGoalScored < nbGoalTaken){
		pathGoalScored.setAttribute("stroke-width", 7);
	}

	pathGoalTaken.setAttribute("stroke-dashoffset", lenght_taken);
	pathGoalScored.setAttribute("stroke-dashoffset", lenght_scored);


	var elem_stat_goal_taken = document.getElementById(stat_taken);
	var elem_stat_goal_scored = document.getElementById(stat_scored);

	if (stat_scored == 0)
		pathGoalScored.setAttribute("display", none);
	if (stat_taken == 0)
		pathGoalTaken.setAttribute("display", none);

	pathGoalTaken.addEventListener(
		"mouseover",
		function (event) {
			elem_stat_goal_taken.style.display = "block";
		});

	pathGoalTaken.addEventListener(
		"mouseout",
		function (event) {
			elem_stat_goal_taken.style.display = "none";
	});

	pathGoalScored.addEventListener(
		"mouseover",
		function (event) {
			elem_stat_goal_scored.style.display = "block";
		});

	pathGoalScored.addEventListener(
		"mouseout",
		function (event) {
			elem_stat_goal_scored.style.display = "none";
	});
}

drawTTTBoard();


function convertNumberToChar(num){
	if (num == "0")
		return ' ';
	if (num == "1")
		return 'X';
	if (num == "2")
		return 'O';

}
function appendRow(htmlelem, row){
	var new_row = document.createElement("tr");
	new_row.id = "TTT_row";
	for (var i = 0; i < row.length; i++){
		var new_cell = document.createElement("td");
		var new_span = document.createElement("span");
		new_span.id = "TTT_span";

		new_cell.id = "TTT_cell";
		new_span.innerHTML = convertNumberToChar (row[i]);
		new_cell.append(new_span);
		new_row.append(new_cell);
	}
	htmlelem.append(new_row);
}

function newTable(board, htmlelem){
	var new_table = document.createElement("table");
	new_table.id = "TTT_table";
	appendRow(new_table, board.substring(0, 3));
	appendRow(new_table, board.substring(3, 6));
	appendRow(new_table, board.substring(6, 9));
	htmlelem.append(new_table);
}

function drawTTTBoard(){

	boardList = document.querySelectorAll(".hidden_result");
	TableList = document.querySelectorAll(".showTTTBoard");

	for (var i = 0; i < boardList.length; i++){
		newTable(boardList[i].innerHTML, TableList[i]);
	}
}

async function removeFriend(id){
	var url = getBaseUrl() + "/remove_friend";
	var response = await fetch(url,{
		method:'POST',
		credentials: 'include',
        headers: {
            'X-CSRFToken': readCookie('csrftoken'),
        },
		body: JSON.stringify({
			"username" : id
		})
	});
	if (response.status == 200){
		document.getElementById(id).style.display = "none";
	}
}
