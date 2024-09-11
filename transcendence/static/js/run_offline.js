var isOfflineGame = false;
var offlineNbPlayer = undefined;
var tick = 0;



var ia = new IA(1, 20, 60);
var up = "up";
var down = "down";

var top_field = "top_field";
var bot_field = "bot_field";

function canUpdate(ia){
	ia.tick ++;
	if (ia.tick >= 60){
		ia.tick = 0;
		return true;
	}
	return false;
}

function getBallDirectionZ(){
	const ballAngle = pongBall.rotation.y;
	const radAngle = (ballAngle * Math.PI / 180);

	var delta_z = -Math.sin(radAngle) * ballVelocity;
	if (delta_z > 0){
		return down;
	}
	return up;
}


function getBallHitX(){

	var ballAngle = pongBall.rotation.y;
	var radAngle = (ballAngle * Math.PI / 180);

	var delta_x = Math.cos(radAngle) * ballVelocity;
	var delta_z = -Math.sin(radAngle) * ballVelocity;
	var ball_pos_x = pongBall.position.x;
	var ball_pos_z = pongBall.position.z;
	var max_tick = ia.max_tick * Math.random();
	max_tick = max_tick < ia.min_tick ? ia.min_tick : max_tick;
	var current_tick = 1;
	while(Math.abs(ball_pos_z) < 29 && current_tick < max_tick){
		ball_pos_z += delta_z;
		ball_pos_x += delta_x;
		if (ball_pos_x >= 13.5 || ball_pos_x <= -13.5){
			delta_x = -delta_x;
		}
		current_tick ++;
	}
	return ball_pos_x;
}

function getBallFieldPosition(ball_z_pos){
	if (ball_z_pos < 0){
		return top_field;
	}
	return bot_field;

}
function chooseNextIaTarget(ia){
	const ballDirZ = getBallDirectionZ();
	const ball_field_position = getBallFieldPosition(pongBall.position.z);
	if (ballDirZ == down && ball_field_position == top_field){
		ia.next_position = 0 + Math.random() - 0.5;
	}
	else {
		ia.next_position = getBallHitX() + ((Math.random() - 0.5 )* ballVelocity) / ia.precision;
	}
}


function IaHandlePrecision(ia, player_position){
	if (Math.abs(player_position - ia.next_position) > playerVelocity){
		return playerVelocity;
	}
	return 0;
}

function IAHandler(ia) {

	if (canUpdate(ia) == true){	
		chooseNextIaTarget(ia);
	}
	if (player2.position.x > ia.next_position ){
		player2_mouv = IaHandlePrecision(ia, player2.position.x);
	}
	else if (player2.position.x < ia.next_position){
		player2_mouv = - IaHandlePrecision(ia, player2.position.x);
	}
	else{
		player2_mouv = 0;
	}

}

function offlineKeydown() {
	if (0 < tick && tick <= 60)
		tick++;
	else
		tick = 0;


	if (isPressed('d')) {
		player1_mouv = -playerVelocity;
	}
	if (isPressed('a')) {
		player1_mouv = playerVelocity;
	}
	if (offlineNbPlayer == 2)
	{
		if (isPressed('ArrowRight')) {
			player2_mouv = -playerVelocity;
		}
		if (isPressed('ArrowLeft')) {
			player2_mouv = playerVelocity;
		}
	}
	else {
		IAHandler(ia);
	}

	if (isPressed('Escape')) {
		if (tick == 0)
		{
			is_stop = !is_stop;
			tick++;
		}
	}
}
