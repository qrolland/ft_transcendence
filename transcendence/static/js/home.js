function play_trailer() {
	displayBackNavbar("stop_trailer();");
	document.getElementById("blur-video").hidden = true;
	document.getElementById("home").hidden = true;
	document.getElementById("home-video").style.zIndex = 5;

}

function stop_trailer() {
	hideBackNavbar(true);
	document.getElementById("blur-video").hidden = false;
	document.getElementById("home").hidden = false;
	document.getElementById("home-video").style.zIndex = -6;
}
