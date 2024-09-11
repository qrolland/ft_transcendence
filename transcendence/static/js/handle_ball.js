function isTouchBorders(BB_borderLeft, BB_borderRight, BB_pongBall) {
	return (BB_borderLeft.intersectsSphere(BB_pongBall) || BB_borderRight.intersectsSphere(BB_pongBall));
}

function isTouchPlayer(BB_player, BB_pongBall) {
	return (BB_player.intersectsSphere(BB_pongBall));
}

function isTouchPlayers(BB_player1, BB_player2, BB_pongBall) {
	return (isTouchPlayer(BB_player1, BB_pongBall) || isTouchPlayer(BB_player2, BB_pongBall));
}

function isOnGoal(BB_player1Goal, BB_player2Goal, BB_pongBall) {
	return (playerGoal(BB_player1Goal, BB_pongBall) || playerGoal(BB_player2Goal, BB_pongBall));
}

function playerGoal(BB_player1Goal, BB_pongBall) {
	return (BB_player1Goal.intersectsSphere(BB_pongBall) || Math.abs(pongBall.position.z) > 29);
}

function randomNb(min, max) {
	return (Math.floor(Math.random() * (max - min + 1)) + min);
}

function fraction_player_x(BB_player, n) {
	var array = [];
	// array.push
	const part = ((BB_player.max.x - BB_player.min.x) / n);
	if (n == 1)
		array.push(BB_player.min.x + (part));
	for (let i = 1; i < n; i++) {
		array.push(BB_player.min.x + (part * i))
	}
	return (array);
	// return (BB_player.min.x + ((BB_player.max.x - BB_player.min.x) / n));
}


function interval_redirections(pongBall, x1, x2, ballAngle, newY) {
	if (x1 <= ballAngle && ballAngle <= x2)
	{
		pongBall.rotation.y = newY;
		return (true);
		// pongBall.rotation.y = assign
		// ? newY
		// : pongBall.rotation.y - newY;
		// return (true);
	}
	else if (-x2 <= ballAngle && ballAngle <= -x1)
	{
		pongBall.rotation.y = -newY;
		return (true);
		// pongBall.rotation.y = assign
		// ? -newY
		// : pongBall.rotation.y + newY;
		// return (true);
	}
	else
	{
		return (false);
	}
}

function handle_rotation(BB_player1, BB_player2, BB_pongBall, pongBall) {

	let split_player;
	let ballAngle = pongBall.rotation.y % 360;
	let p1IsTouching = isTouchPlayer(BB_player1, BB_pongBall);
	let p2IsTouching = isTouchPlayer(BB_player2, BB_pongBall);

	if (
	interval_redirections(pongBall, 0, 15, ballAngle, randomNb(45, 60))
	||	interval_redirections(pongBall, 75, 90, ballAngle, randomNb(45, 65))
	||	interval_redirections(pongBall, 90, 105, ballAngle, randomNb(115, 135))
	||	interval_redirections(pongBall, 165, 180, ballAngle, randomNb(120, 135))
	){}
	else
	{
		pongBall.rotation.y = -(ballAngle % 360);
	}

	ballAngle = pongBall.rotation.y;
	if (p1IsTouching || p2IsTouching)
	{
		if (p1IsTouching)
			split_player = fraction_player_x(BB_player1, 12);
		else if (p2IsTouching)
			split_player = fraction_player_x(BB_player2, 12);

		// P0 | P1 | P2 | P3 | P4 | P5 | P6 | split 8
		// P0 | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | split 12

		if (pongBall.position.x <= split_player[1] && (-90 < ballAngle && ballAngle < 90)
		|| pongBall.position.x >= split_player[9] && (270 > ballAngle && ballAngle > 90)
		){
			pongBall.rotation.y = -(ballAngle % 360) + 180;
		}
		else if (split_player[4] < pongBall.position.x && pongBall.position.x < split_player[6])
		{
			// console.log("Middle of paddle")
			if (p1IsTouching)
				pongBall.rotation.y = randomNb(75, 105);
			else if (p2IsTouching)
				pongBall.rotation.y = randomNb(-75, -105);
		}
		else
		{
			pongBall.rotation.y = randomNb(pongBall.rotation.y - 5, pongBall.rotation.y + 5);
			// console.log("Not special border...")
		}
	}
	while (isTouchPlayers(BB_player1, BB_player2, BB_pongBall)) {
		if (pongBall.position.z >= 0)
			pongBall.position.z -= 0.01;
		else
			pongBall.position.z += 0.01;
	}
}

function update3DpongBall(velocity = defaultBallVelocity) {

	const ballRayon = pongBall.geometry.parameters.radius;
	const ballAngle = pongBall.rotation.y;
	const radAngle = (ballAngle * Math.PI / 180);

	var delta_x = Math.cos(radAngle) * 0.04;
	var delta_z = -Math.sin(radAngle) * 0.04;

	pongBall.rotation.x += ((delta_x * 2) * velocity);
	pongBall.rotation.z += ((delta_z * 2) * velocity);
	if (m3D_pong_ball != undefined && m3D_pong_ball != null)
	{
		m3D_pong_ball.position.set(
			pongBall.position.x,
			pongBall.position.y,
			pongBall.position.z,
		)
		m3D_pong_ball.rotation.set(
			pongBall.rotation.x,
			pongBall.rotation.y,
			pongBall.rotation.z,
		)
	}
}

function handle_goal_update(BB_player1Goal, BB_player2Goal, BB_pongBall, velocity, pongBall) {
	if (playerGoal(BB_player1Goal, BB_pongBall) == true && pongBall.position.z > 0)
	{
		if (player_id == 1)
		{
			score_player_2 += 1;
			if (isOfflineGame == false)
			{
				sendToSocket({
					'status': 'goal-score',
					'who_scored': 2,
					'score_player_1': score_player_1,
					'score_player_2': score_player_2
				})
			}
		}
		pongBall.rotation.set(0, -90, 0);
		pongBall.position.set(0, 1, -10);
		update3DpongBall(velocity);
	}
	else if (playerGoal(BB_player2Goal, BB_pongBall) == true && pongBall.position.z < 0)
	{
		if (player_id == 1)
		{
			score_player_1 += 1;
			if (isOfflineGame == false)
			{
				sendToSocket({
					'status': 'goal-score',
					'who_scored': 1,
					'score_player_1': score_player_1,
					'score_player_2': score_player_2
				})
			}
		}
		pongBall.rotation.set(0, 90, 0);
		pongBall.position.set(0, 1, 10);
		update3DpongBall(velocity);
	}
	if (isOfflineGame == true) {
		document.getElementById('player-left').innerHTML = score_player_1;
		document.getElementById('player-right').innerHTML = score_player_2;
	}
}

function moveForward(
	pongBall,
	BB_pongBall,
	velocity,
	BB_player1Goal,
	BB_player2Goal,
	BB_borderLeft,
	BB_borderRight,
	BB_player1,
	BB_player2,
) {
	const ballRayon = pongBall.geometry.parameters.radius;
	const ballAngle = pongBall.rotation.y;
	const radAngle = (ballAngle * Math.PI / 180);

	var delta_x = Math.cos(radAngle) * velocity;
	var delta_z = -Math.sin(radAngle) * velocity;

	// const new_x = pongBall.position.x + delta_x;
	// const new_z = pongBall.position.z + delta_z;

	pongBall.position.x += delta_x;
	pongBall.position.z += delta_z;
	update3DpongBall(velocity);

	if (isTouchBorders(BB_borderLeft, BB_borderRight, BB_pongBall))
	{
		pongBall.rotation.y = -(ballAngle + 180) % 360;
		return (0);
	}
	if (isTouchPlayers(BB_player1, BB_player2, BB_pongBall))
	{
		handle_rotation(BB_player1, BB_player2, BB_pongBall, pongBall);
		return (0.05);
	}
	if (isOnGoal(BB_player1Goal, BB_player2Goal, BB_pongBall))
	{
		handle_goal_update(BB_player1Goal, BB_player2Goal, BB_pongBall, velocity, pongBall);
		return (-1);
	}
	return (0);
}
