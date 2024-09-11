var performanceMode = true;
var showFPS = false;

var sliderP1Color = 0xFF0000;
var sliderP2Color = 0x0000FF;

var goalP1Color = 0xFF0000;
var goalP2Color = 0x0000FF;

var pongBallColor = 0xFFFFFF;

async function changePerformanceMode() {
	performanceMode = !performanceMode;
	if (performanceMode == false
		&& m3D_tribune == undefined
		&& m3D_transcendence_table == undefined
		&& m3D_p3d_table == undefined)
	{
		m3D_tribune = await getGltfModels('../static/3d_models/tribune.gltf');
		m3D_tribune.scale.set(6, 6, 6);

		m3D_transcendence_table = await getGltfModels('../static/3d_models/transcendence_table.gltf');
		m3D_transcendence_table.scale.set(5, 5, 5);
		m3D_p3d_table = await getGltfModels('../static/3d_models/p3d_table.gltf');
		m3D_p3d_table.scale.set(5, 5, 5);
	}
}

function createLight(color, position) {
	const pLight = new PointLight(color, 400);
	scene.add(pLight);
	pLight.position.set(position.x, position.y, position.z);
	// topLight.castShadow = true;
	// topLight.shadow.camera.bottom -= 25;
	// topLight.shadow.camera.top += 25;
}

function restoreEnvToDefaultValue() {
	is_stop = false;
	x = 0;
	y = 20;
	z = 70;

	score_player_1 = 0;
	score_player_2 = 0;


	radius = 0;
	frame = 0;
	camSpeed = 0.1; // 0.05

	ballVelocity = defaultBallVelocity;
	rvalue = 0;

	readyState = 0;
	playerIsPlaying = false;

	pressedKey = {};
	oppsKey = {};
}

function destroyEnvironment() {
	TWEEN.removeAll();
	restoreEnvToDefaultValue();
	if (renderer) {
		renderer.clear();
		renderer = null;
	}
	scene = null;
	camera = null;
	window.removeEventListener('resize', updateCanvas);
	window.removeEventListener('popstate', popStateFunction);
	document.removeEventListener('visibilitychange', handleVisibilityChange);
	playerIsPlaying = false;
	isLauching = false;
	gameCanvaIsRunning = false;
	clearTimeout(TIMEOUT_gameLoop);
	clearInterval(dotsWaitingIntervalID);
	clearInterval(runGameIntervalID);
	cancelAnimationFrame(gameRequestAnimation);
	clearInterval(compteurIntervalID);
	clearInterval(keydownIntervalID);
	clearInterval(sendPlayerPosIntervalID);
}

var stats;
if (showFPS){
	stats = new Stats();
	stats.showPanel(0);
	document.body.appendChild(stats.dom);
}

function updateColor() {
	try {
		sliderP1Color = document.getElementById("picker-slider-player1").value;
		sliderP2Color = document.getElementById("picker-slider-player2").value;

		goalP1Color = document.getElementById("picker-goal-player1").value;
		goalP2Color = document.getElementById("picker-goal-player2").value;

		pongBallColor = document.getElementById("picker-pong-ball").value;

	} catch (error) {
		;
	}
}

function initEnvironment() {
	playerIsPlaying = false;
	destroyEnvironment();
	const canva = document.getElementById('pong_canvas');
	renderer = new WebGLRenderer({ canvas: canva, antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setClearColor(0x000000);



	scene = new Scene();


	const lightColor = [
		0xFFF800,
		0xFF0015,
		0x1000FF,
		0xFFFF00,
		0xEF5FFF
	]
	const topLight = new PointLight(0xFFFFFF, (500));
	scene.add(topLight);
	topLight.position.set(0, 30, 0);


	const floorGeometry = new PlaneGeometry(150, 150);
	const floorMaterial = new MeshStandardMaterial({
		color: 0x111111,
		roughness: 0.20,
		metalness: 1,
		side: DoubleSide
	});
	const floor = new Mesh( floorGeometry, floorMaterial );
	floor.rotation.x = -0.5 * Math.PI; // Incliner de 90 degrees
	floor.position.y = -0.5;
	scene.add(floor);

	if (performanceMode == false)
	{
		scene.add(m3D_tribune);
		scene.add(m3D_transcendence_table);
		scene.add(m3D_p3d_table);

		for (let i = 0; i < lightColor.length; i++) {

			createLight(lightColor[i], {'x': -6 + (i * 3), 'y': 15, 'z': -45});

		}
		for (let i = 0; i < lightColor.length; i++) {

			createLight(lightColor[i], {'x': -6 + (i * 3), 'y': 15, 'z': 45});

		}
	}

	scene.add(m3D_game_ground);
	scene.add(m3D_pong_ball);

	updateColor();

	m3D_pong_ball.traverse(function(child) {
		if (child.isMesh && child.name === "Sphere_1") {
			console.log(child.material.emissive.set(pongBallColor));
		}
	});

	camera = new PerspectiveCamera(
		60,
		(mainDiv.offsetWidth - 200) / (mainDiv.offsetHeight - 220),
		0.1,
		1000
	);

	restoreEnvToDefaultValue();

	score_element_left = document.getElementById("player-left");
	score_element_right = document.getElementById("player-right");


	score_element_left.innerHTML = 0;
	score_element_right.innerHTML = 0;
	if (player_id == 1)
	{
		score_element_left.style.color = goalP1Color.toString(16);
		score_element_right.style.color = goalP2Color.toString(16);
	}
	else if (player_id == 2)
	{
		score_element_left.style.color = goalP2Color.toString(16);
		score_element_right.style.color = goalP1Color.toString(16);

	}


	m3D_game_ground.traverse(function(child) {
		// player1
		if (child.isMesh && child.name === "Cube003") {
			console.log(child.material.emissive.set(goalP1Color));
		}
		// player2
		if (child.isMesh && child.name === "Cube001") {
			console.log(child.material.emissive.set(goalP2Color));
		}
	});


	const borderLeftGeometry = new PlaneGeometry(8, 60);
	// const borderLeftMaterial = new MeshStandardMaterial({color: 0xFFFFFF, side: DoubleSide});
	const borderLeft = new Mesh( borderLeftGeometry );
	borderLeft.rotation.set(
		0,
		-0.5 * Math.PI,
		-0.5 * Math.PI
	);
	borderLeft.position.set(-14.1, 4, 0);
	BB_borderLeft = new Box3(new Vector3(), new Vector3());
	BB_borderLeft.setFromObject(borderLeft);


	// #########################################
	// INIT BORDER RIGHT
	// #########################################
	const borderRightGeometry = new PlaneGeometry(8, 60);
	// const borderRightMaterial = new MeshStandardMaterial({color: 0xFFFFFF, side: DoubleSide});
	const borderRight = new Mesh( borderRightGeometry );
	borderRight.rotation.set(
		0,
		-0.5 * Math.PI,
		-0.5 * Math.PI
	);
	borderRight.position.set(14.1, 4, 0);
	// borderRight.receiveShadow = true;
	BB_borderRight = new Box3(new Vector3(), new Vector3());
	BB_borderRight.setFromObject(borderRight);


	// #########################################
	// INIT GOAL PLAYER - 1
	// #########################################
	const player1GoalGeometry = new PlaneGeometry(4, 30);
	const player1GoalMaterial = new MeshBasicMaterial({
		color: 0xE82A0C,
		side: DoubleSide
	});
	player1Goal = new Mesh( player1GoalGeometry, player1GoalMaterial );
	player1Goal.rotation.set(0, 0, -0.5 * Math.PI); // Incliner de 90 degrees
	player1Goal.position.set(0, 2, 30);
	BB_player1Goal = new Box3(new Vector3(), new Vector3());
	BB_player1Goal.setFromObject(player1Goal);


	// #########################################
	// INIT GOAL PLAYER - 2
	// #########################################
	const player2GoalGeometry = new PlaneGeometry(4, 30);
	const player2GoalMaterial = new MeshBasicMaterial({
		color: 0x1E83D1,
		side: DoubleSide
	});
	player2Goal = new Mesh( player2GoalGeometry, player2GoalMaterial );
	player2Goal.rotation.set(0, 0, -0.5 * Math.PI); // Incliner de 90 degrees
	player2Goal.position.set(0, 2, -30);
	BB_player2Goal = new Box3(new Vector3(), new Vector3());
	BB_player2Goal.setFromObject(player2Goal);

	// #########################################
	// INIT BALLS
	// #########################################
	const pongBallGeometry = new SphereGeometry(ballRadius, 30, 30);
	const pongBallMaterial = new MeshBasicMaterial({
		color: 0x00FF00,
	});
	pongBall = new Mesh( pongBallGeometry, pongBallMaterial );
	pongBall.castShadow = true;
	pongBall.rotation.y = 30;

	// BALLS DEFAULT POSITION
	pongBall.rotation.set(0, 30, 0);


	// NoTouch Test
	pongBall.rotation.set(0, 90, 0);
	pongBall.position.set(0, 1, 10);
	update3DpongBall(defaultBallVelocity);

	BB_pongBall = new Sphere(pongBall.position, ballRadius);

	// #########################################
	// INIT PLAYERS
	// #########################################
	// PLAYER - 1
	const player1Geometry = new BoxGeometry( playerWidth, playerHeight, playerDepth );
	const player1Material = new MeshBasicMaterial({
		color: sliderP1Color,
	})
	player1 = new Mesh( player1Geometry, player1Material );
	player1.position.z = 25;

	BB_player1 = new Box3(new Vector3(), new Vector3());
	BB_player1.setFromObject(player1);

	// PLAYER - 2
	const player2Geometry = new BoxGeometry( playerWidth, playerHeight, playerDepth );
	const player2Material = new MeshBasicMaterial({
		color: sliderP2Color,
	})
	player2 = new Mesh( player2Geometry, player2Material );
	player2.position.z = -25;

	BB_player2 = new Box3(new Vector3(), new Vector3());
	BB_player2.setFromObject(player2);

	// #########################################
	// INIT HELPERS
	// #########################################
	// const gridHelper = new GridHelper(60, 10);
	// const axesHelper = new AxesHelper(7);


	scene.add(
		// topLight,
		// player1Goal,
		// player2Goal,
		// pongBall,
		player1,
		player2,
		// gridHelper,
		// axesHelper,
	)
}
