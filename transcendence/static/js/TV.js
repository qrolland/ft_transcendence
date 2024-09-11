var TVplayer1;
var TVplayer2;
var TVCamera;
var TVDiv;
var TVrenderer;
var TVScene;
var TVpongBall;

var playerWidth = 8;
var playerHeight = 2;
var playerDepth = 0.5;
var TVvelocity = 0;

var TVcontrols;
var requestAnimationFrameTVID;


function update3DTVpongBall(velocity) {
	const ballAngle = TVpongBall.rotation.y;
	const radAngle = (ballAngle * Math.PI / 180);

	var delta_x = Math.cos(radAngle) * 0.04;
	var delta_z = -Math.sin(radAngle) * 0.04;

	TVpongBall.rotation.x += ((delta_x * 2) * velocity);
	TVpongBall.rotation.z += ((delta_z * 2) * velocity);
	if (m3D_pong_ball != undefined && m3D_pong_ball != null)
	{
		m3D_pong_ball.position.set(
			TVpongBall.position.x,
			TVpongBall.position.y,
			TVpongBall.position.z,
		)
		m3D_pong_ball.rotation.set(
			TVpongBall.rotation.x,
			TVpongBall.rotation.y,
			TVpongBall.rotation.z,
		)
	}
}

function updateTVCanvas() {
	TVCamera.aspect = (TVDiv.offsetWidth) / (TVDiv.offsetHeight);
	TVCamera.updateProjectionMatrix();
	TVrenderer.setSize( TVDiv.offsetWidth, TVDiv.offsetHeight);
}

function restoreDefaultTV() {
	document.getElementById("tv-player-1").innerHTML = "X";
	document.getElementById("tv-player-2").innerHTML = "X";
	document.getElementById("tv-score-p1").innerHTML = "0";
	document.getElementById("tv-score-p2").innerHTML = "0";
	TVplayer1.position.x = 0;
	TVplayer2.position.x = 0;
	TVvelocity = 0;
	TVpongBall.position.set(0, 1, 0);

}

function TVanimate() {
	if (document.getElementById('tv_canvas') == null ||  document.getElementById('tv_canvas') == undefined) {
		cancelAnimationFrame(requestAnimationFrameTVID);
		window.removeEventListener('resize', updateTVCanvas);
		return ;
	}
	requestAnimationFrameTVID = requestAnimationFrame( TVanimate );
	TVcontrols.update();
	update3DTVpongBall(TVvelocity);
	TVrenderer.render( TVScene, TVCamera );
}

function createTVLight(color, position) {
	const pLight = new PointLight(color, 400);
	TVScene.add(pLight);
	pLight.position.set(position.x, position.y, position.z);
	// topLight.castShadow = true;
	// topLight.shadow.camera.bottom -= 25;
	// topLight.shadow.camera.top += 25;
}

async function fetchAllModels() {
	if (m3D_tribune == undefined
		&& m3D_transcendence_table == undefined
		&& m3D_p3d_table == undefined)
	{
		m3D_tribune = await getGltfModels('../static/3d_models/tribune.gltf');
		m3D_tribune.scale.set(6, 6, 6);
		// scene.add(m3D_tribune);

		m3D_transcendence_table = await getGltfModels('../static/3d_models/transcendence_table.gltf');
		m3D_transcendence_table.scale.set(5, 5, 5);

		m3D_p3d_table = await getGltfModels('../static/3d_models/p3d_table.gltf');
		m3D_p3d_table.scale.set(5, 5, 5);
	}
}


async function initTV() {
	const canva = document.getElementById('tv_canvas');
	TVrenderer = new WebGLRenderer({ canvas: canva, antialias: true });
	TVrenderer.shadowMap.enabled = true;
	TVrenderer.setClearColor(0x000000);

	TVScene = new Scene();
	TVDiv = document.getElementById('tv-canva-div');

	TVCamera = new PerspectiveCamera(
		60,
		(TVDiv.offsetWidth - 200) / (TVDiv.offsetHeight - 220),
		0.1,
		1000
	);
	updateTVCanvas();

	TVcontrols = new OrbitControls( TVCamera, TVrenderer.domElement );


	await fetchAllModels();

	if (hasLoadingModel == 'success')
	{
		const lightColor = [
			0xFFF800,
			0xFF0015,
			0x1000FF,
			0xFFFF00,
			0xEF5FFF
		]
		const topLight = new PointLight(0xFFFFFF, (500));
		TVScene.add(topLight);
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
		TVScene.add(floor);

		TVScene.add(m3D_tribune);
		TVScene.add(m3D_transcendence_table);
		TVScene.add(m3D_p3d_table);

		// for (let i = 0; i < lightColor.length; i++) {

		// 	createTVLight(lightColor[i], {'x': -6 + (i * 3), 'y': 15, 'z': -45});

		// }
		// for (let i = 0; i < lightColor.length; i++) {

		// 	createTVLight(lightColor[i], {'x': -6 + (i * 3), 'y': 15, 'z': 45});

		// }

		TVScene.add(m3D_game_ground);
		TVScene.add(m3D_pong_ball);

		m3D_pong_ball.traverse(function(child) {
			if (child.isMesh && child.name === "Sphere_1") {
				console.log(child.material.emissive.set(0xFFFFFF));
			}
		});
	}

	// PLAYER - 1
	const player1Geometry = new BoxGeometry( playerWidth, playerHeight, playerDepth );
	const player1Material = new MeshBasicMaterial({
		color: 0xFFFFFF,
	})
	TVplayer1 = new Mesh( player1Geometry, player1Material );
	TVplayer1.position.z = 25;

	// PLAYER - 2
	const player2Geometry = new BoxGeometry( playerWidth, playerHeight, playerDepth );
	const player2Material = new MeshBasicMaterial({
		color: 0xFFFFFF,
	})
	TVplayer2 = new Mesh( player2Geometry, player2Material );
	TVplayer2.position.z = -25;

	// #########################################
	// INIT BALLS
	// #########################################
	const pongBallGeometry = new SphereGeometry(1, 30, 30);
	const pongBallMaterial = new MeshBasicMaterial({
		color: 0x00FF00,
	});
	TVpongBall = new Mesh( pongBallGeometry, pongBallMaterial );
	TVpongBall.castShadow = true;
	TVpongBall.rotation.y = 30;

	// NoTouch Test
	TVpongBall.rotation.set(0, 90, 0);
	TVpongBall.position.set(0, 1, 0);
	update3DTVpongBall(0.3);


	TVScene.add(TVplayer1, TVplayer2);


	TVCamera.position.set(80, 50, 0);
	TVCamera.lookAt(TVScene.position);
	TVcontrols.update();

	updateTVCanvas();
	if (TVrenderer != undefined) {
		TVrenderer.render(TVScene, TVCamera);
	}
	window.addEventListener('resize', updateTVCanvas);
	TVanimate();
}


initTV();
