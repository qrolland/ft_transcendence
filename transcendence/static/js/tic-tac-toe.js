var count = 0;
var player = 1;
var board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
var endGame = false;
var gamesPlayed = document.getElementById("games-played-ttt").value;
var nbWins = document.getElementById("nb-win-ttt").value;
var nbLoses = document.getElementById("nb-lose-ttt").value;
var username = document.getElementById("username").textContent;
var opponent = document.getElementById("opponent-ttt").value;
var winner = document.getElementById("winner-ttt").value;
var matchmakingMode = false;
var received = false;
var activePlayer = 1;
var opponent_left = false;

var canvas = document.getElementById("tic-tac-toe-board");
var context = canvas.getContext('2d');
var canvasSize = 500;
var sectionSize = canvasSize / 3;
canvas.width = canvasSize;
canvas.height = canvasSize;
context.translate(0.5, 0.5);
context.lineWidth = 10;

function choose() {
    document.getElementById("games-div").hidden = true;
    // document.getElementById("pong").style.display = "none";
    // document.getElementById("ttt").style.display = "none";
    // document.getElementById("local-ttt").style.display = "block";
    // document.getElementById("online-ttt").style.display = "block";
    document.getElementById("game-mode-choice").style.display ="flex";
    displayBackNavbar('\
    document.getElementById("games-div").hidden = false;\
    document.getElementById("game-mode-choice").style.display ="none";\
    hideBackNavbar(true)\
    ')
}



// function online() {
// 	document.getElementById("left-btn").style.display = 'inline-block';
//     document.getElementById("game-mode-choice").style.display ="none";
//     document.getElementById("waiting-opponent").style.display ="block";
//     hideBackNavbar(false);
//     clickOpenSocket();
//     window.addEventListener('', forEventListner('unload'));


//     window.addEventListener('popstate', forEventListner('popstate'));
// }
function forEventListner1(){
	clickCloseSocket();
	window.removeEventListener('unload', forEventListner1);

}
function forEventListner2(){
	clickCloseSocket();
	window.removeEventListener('popstate', forEventListner2);

}


function online() {
	document.getElementById("left-btn").style.display = 'inline-block';
    document.getElementById("game-mode-choice").style.display ="none";
    document.getElementById("waiting-opponent").style.display ="block";
    hideBackNavbar(false);
    clickOpenSocket();
    // window.addEventListener('unload', function(event) {
    //     clickCloseSocket();
    // });
    // window.addEventListener('popstate', function() {
    //     clickCloseSocket();
    // });

	window.addEventListener('unload', forEventListner1);
    window.addEventListener('popstate', forEventListner2);
}

function adjustCanvasSize() {
    var boundingRect = canvas.getBoundingClientRect();
    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height;
    sectionSize = canvas.width / 3;
}

function resetGame() {
    count = 0;
    player = 1;
    endGame = false;
    board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    document.getElementById("restart-ttt").style.display = "none";
    document.getElementById("score-message-ttt").textContent = "Rematch!";
    adjustCanvasSize();
    drawBoard();
	window.removeEventListener('click', resetGame);

}

function handleVisibilityChange() {
	if (document.hidden) {
        clickCloseSocket();
	}
}

function start(player_id) {
    document.getElementById("game-mode-choice").style.display ="none";
    document.getElementById("waiting-opponent").style.display ="none";
    document.getElementById("log-player-info").style.display = 'none';
    document.getElementById("socket-waiting").style.display = "none";
    document.getElementById("div-timer-running").style.display = 'none';
    document.getElementById("score-message-ttt").style.display = "block";
    document.getElementById("tic-tac-toe-board").style.display = "block";
    document.getElementById("left-btn").style.display = "inline-block";
    document.getElementById("restart-ttt").addEventListener('click', resetGame);
    hideBackNavbar(false);

    if (endGame) {
        return;
    }
    if (matchmakingMode) {
        if (opponent_left) {
            document.getElementById("score-message-ttt").textContent = "Your opponent has left";
            document.getElementById("tic-tac-toe-board").style.display = "none";
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('popstate', function() {
            clickCloseSocket();
        });
        socket.addEventListener("message", function (event) {
            var data = JSON.parse(event.data);
            data=data.message;
            var player1Name = data.player1_name;
            var player2Name = data.player2_name;

            if (data.status ==  'player-left') {
                opponent_left = true;
            }
            if (opponent_left) {
                document.getElementById("score-message-ttt").textContent = "Your opponent has left";
            }
            if (data.x !== undefined && data.y !== undefined) {
                addPlayingPiece(data, activePlayer, player_id, matchmakingMode);
                drawBoard();
                setTimeout(() => {
                    if (!checkWhoWin(1, true, player1Name, player2Name, player_id) && !checkWhoWin(2, true, player1Name, player2Name, player_id)) {
                        checkIsOver(true, player1Name, player2Name);
                    }
                }, 100);
                activePlayer = (activePlayer == 1) ? 2 : 1;
            }
        });
        if (activePlayer == player_id && !opponent_left) {
            document.getElementById("score-message-ttt").textContent = "It's your turn!";
        }
        if (activePlayer != player_id && !opponent_left) {
            document.getElementById("score-message-ttt").textContent = "Wait for your opponent's move...";
        }
        canvas.addEventListener('mouseup', function (event) {
            if (activePlayer == player_id && !opponent_left) {
                var mouse = getCanvasMousePosition(event);
                var mouse = getCanvasMousePosition(event);
				if (checkifBoardCaseIsEmpty(mouse) == false)
					return;
                addPlayingPiece(mouse, activePlayer, player_id, matchmakingMode);
                drawBoard();
                received = true;
                socket.send(JSON.stringify(mouse));
            }
        });
    } else {
        canvas.addEventListener('mouseup', function (event) {

            var mouse = getCanvasMousePosition(event);
			if (checkifBoardCaseIsEmpty(mouse) == false)
					return;
            addPlayingPiece(mouse, player, undefined, false);
            player = player == 1 ? 2 : 1;
            drawBoard();
            setTimeout(() => {
                if (!checkWhoWin(1, false, undefined, undefined, 0) && !checkWhoWin(2, false, undefined, undefined, 0)) {
                    checkIsOver(false, undefined, undefined);
                }
            }, 100);
        });
    }
    adjustCanvasSize();
    drawBoard();
}

function checkifBoardCaseIsEmpty(mouse){
	var xCordinate = Math.floor (mouse.x / sectionSize);
	var yCordinate = Math.floor (mouse.y / sectionSize);

	return( board[yCordinate][xCordinate] == 0)
}

function addPlayingPiece(mouse, player, player_id, matchmakingMode) {
    var xCordinate;
    var yCordinate;
    if (endGame){
        return;
    }
    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            xCordinate = x * sectionSize;
            yCordinate = y * sectionSize;
            if (mouse.x >= xCordinate && mouse.x <= xCordinate + sectionSize &&
                mouse.y >= yCordinate && mouse.y <= yCordinate + sectionSize && board[y][x] == 0) {
                board[y][x] = player;
                count++;
                if (matchmakingMode) {
                    if (player == player_id) {
                        document.getElementById("score-message-ttt").textContent = "Wait for your opponent's move...";
                    }
                    else {
                        document.getElementById("score-message-ttt").textContent = "It's your turn!";
                    }
                }
            }
        }
    }
}

function getCanvasMousePosition(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function clearPlayingArea(xCordinate, yCordinate) {
    context.fillStyle = "#2e4890";
    context.fillRect(
        xCordinate,
        yCordinate,
        sectionSize,
        sectionSize
    );
}

function drawO(xCordinate, yCordinate) {
    var halfSectionSize = (0.5 * sectionSize);
    var centerX = xCordinate + halfSectionSize;
    var centerY = yCordinate + halfSectionSize;
    var radius = 0.25 * sectionSize;
    var startAngle = 0 * Math.PI;
    var endAngle = 2 * Math.PI;
    context.beginPath();
    context.arc(centerX, centerY, radius, startAngle, endAngle);
    context.stroke();
  }

function drawX(xCordinate, yCordinate) {
    context.beginPath();
    var offset = 0.28 * sectionSize;
    context.moveTo(xCordinate + offset, yCordinate + offset);
    context.lineTo(xCordinate + sectionSize - offset, yCordinate + sectionSize - offset);
    context.moveTo(xCordinate + offset, yCordinate + sectionSize - offset);
    context.lineTo(xCordinate + sectionSize - offset, yCordinate + offset);
    context.stroke();
}

function drawBoard() {
    var xCordinate;
    var yCordinate;

    context.lineWidth = 8;
    context.strokeStyle = "#fff";
    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        xCordinate = x * sectionSize;
        yCordinate = y * sectionSize;
        clearPlayingArea(xCordinate, yCordinate);
        if (board[y][x] === 1) {
          drawX(xCordinate, yCordinate);
        } else if (board[y][x] === 2) {
          drawO(xCordinate, yCordinate);
        }
      }
    }
    var lineStart = 4;
    var lineLenght = canvasSize - 5;
    context.beginPath();
    for (var y = 1; y <= 2; y++) {
      context.moveTo(lineStart, y * sectionSize);
      context.lineTo(lineLenght, y * sectionSize);
    }
    for (var x = 1; x <= 2; x++) {
      context.moveTo(x * sectionSize, lineStart);
      context.lineTo(x * sectionSize, lineLenght);
    }
    context.stroke();
}

function checkWhoWin(number, matchmakingMode, player1Name, player2Name, player_id) {
    let isWin = false;

    for (let i = 0; i < 3; i++) {
        if ((board[i][0] === number && board[i][1] === number && board[i][2] === number) || (board[0][i] === number && board[1][i] === number && board[2][i] === number)) {
            isWin = true;
            endGame = true;
            if (number === 1) {
                nbWins++;
                if (matchmakingMode) {
                    winner = player1Name;
                    if (player_id == 1) {opponent = player2Name;} else {opponent = player1Name;}
                    displayScoreMessage(winner + " wins the game!", true);
                }
                else {
                    winner = username;
                    displayScoreMessage(winner + " wins the game!", false);
                }
            }
            else {
                nbLoses++;
                if (matchmakingMode) {
                    winner = player2Name;
                    if (player_id == 1) {opponent = player2Name;} else {opponent = player1Name;}
                    displayScoreMessage(winner + " wins the game!", true);
                }
                else {
                    winner = "invited";
                    displayScoreMessage("Invited player wins the game!", false);
                }
            }
        }
    }
    if ((board[0][0] === number && board[1][1] === number && board[2][2] === number) || (board[0][2] === number && board[1][1] === number && board[2][0] === number)) {
        isWin = true;
        endGame = true;
        if (number === 1) {
            nbWins++;
            if (matchmakingMode) {
                winner = player1Name;
                if (player_id == 1) {opponent = player2Name;} else {opponent = player1Name;}
                displayScoreMessage(winner + " wins the game!", true);
            }
            else {
                winner = username;
                displayScoreMessage(winner + " wins the game!", false);
            }
        }
        else {
            nbLoses++;
            if (matchmakingMode) {
                winner = player2Name;
                if (player_id == 1) {opponent = player2Name;} else {opponent = player1Name;}
                displayScoreMessage(winner + " wins the game!", true);
            }
            else {
                winner = "invited";
                displayScoreMessage("Invited player wins the game!", false);
            }
        }
    }
    return isWin;
}

function boardToString(board){
	str = "";
	for (var i = 0; i < 3; i++){
		for (var j = 0; j < 3; j++){
			str += board[i][j];
		}
	}
	return str;
}

function displayScoreMessage(message, matchmakingMode) {
    document.getElementById("score-message-ttt").textContent = message;
    document.getElementById("score-message-ttt").style.display = "block";
    document.getElementById("restart-ttt").style.display = "none";
    gamesPlayed++;
    document.getElementById('games-played-ttt').value = gamesPlayed;
    document.getElementById('nb-win-ttt').value = nbWins;
    document.getElementById('nb-lose-ttt').value = nbLoses;
    document.getElementById('opponent-ttt').value = opponent;
    document.getElementById('winner-ttt').value = winner;
    // Obtenez le formulaire et créez un objet FormData avec ses données
    var formData = new FormData(document.getElementById('ttt-form'));
    var crsfcookie = readCookie('csrftoken');
    // Utilisez Fetch pour envoyer les données au serveur
    fetch(getBaseUrl() + "/game_update/", {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-CSRFToken': crsfcookie,
        },
        body:
			JSON.stringify({
				"games-played-ttt" : gamesPlayed,
				"nb-win-ttt" : nbWins,
				"nb-lose-ttt" : nbWins,
				"opponent-ttt" : opponent,
				"winner-ttt" : winner,
				"board" : boardToString(board)
			})
		  // Utilisez formData comme corps de la requête
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
    if (matchmakingMode) {
        document.getElementById("restart-ttt").style.display = "none";
    }
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

function checkIsOver(matchmakingMode, player1Name, player2Name) {
    if (count >= 9) {
        endGame = true;
        winner = "";
        if (matchmakingMode) {
            if (player_id == 1) {opponent = player2Name;} else {opponent = player1Name}
        }
        displayScoreMessage("Game is over!");
    }
}

function updateGameChoices() {
    var images = document.querySelectorAll('.button-ttt');
    var windowWidth = window.innerWidth;

    images.forEach(function(image) {
        image.style.height = (0.2 * windowWidth) + 'px';
    });
}

window.addEventListener('resize', function () {
    updateGameChoices();
    adjustCanvasSize();
    drawBoard();
});

document.addEventListener("DOMContentLoaded", function () {
    // Votre code JavaScript ici
    start(matchmakingMode, player);
});
