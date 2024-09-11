class tournament_info{
	constructor(mode, match_id){
		this.mode = false;
		this.match_id = match_id;
		this.state = "waiting";
		this.socket_tournament = null;
		this.stated_match=true;
		this.result_sent=false;
		this.save_player_id=undefined;
		this.player1_name = undefined;
		this.player2_name = undefined;
		this.whoami = undefined;
		this.special_state = undefined;
		this.socket_match_was_opened = false;
		this.tournament_name = 'Tournament';
		this.admin_name = undefined;

	}
}


class IA{
	constructor(precision, max_tick, min_tick){
		this.last_move = undefined;
		this.tick = 0;
		this.next_position = undefined;
		// how far from optimal position ai will be 
		this.precision = precision; // higher stronger ia minimum is 1
		// how far ia will calculate the ball postion
		// bigger spread == bigger random
		this.max_tick = max_tick; // higher stronger ia no minimum
		this.min_tick = min_tick; // higher stronger  but < max_tick 

		// strong ia for example
		// var ia = new IA(1, 30, 60);

	}
}

var tournament = new tournament_info(false, "");
var regex_profile = /profile\/./;
var lang = "en";

let urlRoutes = {
	404: {
		template: "/404.html",
		title: "404",
		description: "No route found"
	},
	"/": {
		template: "/home.html",
		title: "PONG - Home",
		description: "Main Page",
		page_class: 1
	},

	"/home": {
		template: "/home.html",
		title: "PONG - Home",
		description: "Main Page",
		page_class: 1
	},
	"/home/": {
		template: "/home.html",
		title: "PONG - Home",
		description: "Main Page",
		page_class: 1
	},

	"/index": {
		template: "index.html",
		title: "Lorem Page",
		description: "Lorem",
		page_class: 1
	},

	"/profile": {
		template: "/profile.html",
		title: "PONG - Profil",
		description: "Lorem",
		page_class: 5
	},
	"/profile/": {
		template: "/profile.html",
		title: "PONG - Profil",
		description: "Lorem",
		page_class: 5
	},

	"/settings": {
		template: "/settings.html",
		title: "PONG - Settings",
		description: "Lorem",
		page_class: 6
	},
	"/settings/": {
		template: "/settings.html",
		title: "PONG - Settings",
		description: "Lorem",
		page_class: 6
	},

	"/game": {
		template: "/game.html",
		title: "PONG - Games",
		description: "Lorem",
		page_class: 2
	},
	"/game/": {
		template: "/game.html",
		title: "PONG - Games",
		description: "Lorem",
		page_class: 2
	},
	"/top": {
		template: "/top.html",
		title: "PONG - Leaderboard",
		description: "Lorem",
		page_class: 4
	},
	"/top/": {
		template: "/top.html",
		title: "PONG - Leaderboard",
		description: "Lorem",
		page_class: 4
	},

	"/success": {
		template: "/success.html",
		title: "test Page",
		description: "test",
		page_class: undefined
	},
	"/login": {
		template: "/login.html",
		title: "PONG - Register | Login",
		description: "test",
		page_class: undefined
	},
	"/logout": {
		template: "/logout.html",
		title: "PONG - Logout",
		description: "test",
		page_class: undefined
	},
	"/tournament": {
		template: "/tournament.html",
		title: "PONG - Tournament",
		description: "test",
		page_class: 3
	},
	"/tournament/": {
		template: "/tournament.html",
		title: "PONG - Tournament",
		description: "test",
		page_class: 3
	},
	"/ponggame/": {
		template: "/ponggame.html",
		title: "PONG - Pong3D",
		description: "test",
		page_class: 2
	},
	"/ponggame": {
		template: "/ponggame.html",
		title: "PONG - Pong3D",
		description: "test",
		page_class: 2
	},
	"/tv": {
		template: "/tv.html",
		title: "PONG - TV",
		description: "test",
		page_class: 7
	},
	"/tv/": {
		template: "/tv.html",
		title: "PONG - TV",
		description: "test",
		page_class: 7
	}


};


function popSlash(routeKey) {
	return (routeKey && routeKey.endsWith('/') && routeKey.length > 1)
	? routeKey.substr(0, routeKey.length - 1)
	: routeKey
}

const urlRoute = async (routeKey) => {
	const location = window.location.pathname;
	var route = new Object();

	if (regex_profile.test(routeKey) == true){
		// route = routeKey;
		route.template = routeKey;
		route.page_class = 5;
		route.description = "profile";
		route.title = "profile";
	}
	else{
		route = urlRoutes[routeKey] || urlRoutes["/"];
	}
	// Utilisez la clé de la route pour obtenir les informations de la route

	if (popSlash(location) != popSlash(routeKey)) {
		if (regex_profile.test(route.template) == true){
			// window.location.pathname = "profile";
			window.history.pushState({}, "", "/profile");
		}
		else{
			window.history.pushState({}, "", routeKey);

		}
	}
	urlLocationHandler(route);
}

const urlLocationHandler = async (route) => {

	updateNavbar(route.page_class);
	const response = await fetch(route.template);
	const html = await response.text();
	if (route.template == "/logout.html"){
		document.getElementsByTagName("html")[0].innerHTML  = html;
		window.location.pathname = "accounts/login";
		return;
	}
	// if (regex_profile.test(route.template) == true){
	// 	// window.location.pathname = "profile";

	// }
	// Créez un nouveau div en dehors du DOM
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
	const newContent = tempDiv.querySelector('#new_content');

	// document.getElementById("content").innerHTML = newContent.innerHTML;
	document.getElementById("content").innerHTML = newContent.innerHTML;
	// Récupérez tous les scripts du nouveau div
	const scripts = tempDiv.querySelectorAll('script');

	// Exécutez chaque script individuellement
	document.getElementById("script_div").innerHTML = "";
	scripts.forEach((script) => {
		const newScript = document.createElement('script');
		if (script.src != ""){
			newScript.src = script.src;
		}
		newScript.textContent = script.textContent;
		if (newScript != null) {
			document.getElementById("script_div").appendChild(newScript);
		}
	});

	document.title = route.title;
	document.querySelector('meta[name="description"]').setAttribute("content", route.description);


};

window.onpopstate = () => {
	const location = window.location.pathname;
	const route = urlRoutes[location] || urlRoutes["/"];
	urlLocationHandler(route);
};

// Initialisation lors du chargement de la page
window.addEventListener("DOMContentLoaded", () => {
	const location = window.location.pathname;
	const route = urlRoutes[location] || urlRoutes["/"];
	urlLocationHandler(route);
});

// window.addEventListener('popstate', function(event) {
//     // Votre code ici
//     console.log("L'utilisateur a navigué dans son historique de navigation.");
//     // Vous pouvez accéder à l'objet state de l'événement pour des détails sur l'état de l'historique
//     console.log(event.state);
// });

// function translate(){
// 	var elems = document.body.getElementsByTagName("*");
// 	console.log(elems);
// }




function FindGreenRedColorFromPercentage(percentage) {
    return 'hsl(' + percentage + ', 100%, 50%)';
}

function showTrustFactor(trust, div_id){
	div = document.getElementById(div_id);
	icon = document.createElement("i");
	icon.className="fa-solid fa-circle-check fa-2xl";
	icon.style.color = FindGreenRedColorFromPercentage(trust);
	icon.id = "ProfileTrustIcon";
	div.appendChild(icon);

	document.getElementById("ProfileTrustIcon").addEventListener(
		"mouseover",
		function (event) {
			document.getElementById("trust_factor").style.display = "block";
		});

	document.getElementById("ProfileTrustIcon").addEventListener(
		"mouseout",
		function (event) {
			document.getElementById("trust_factor").style.display = "none";
	});
}


function getBaseUrl(){
	return 	document.querySelector('meta[name="connexion"]').content;
}


function getBaseWss(){
	return 	document.querySelector('meta[name="websocket"]').content;
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer2 = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer2.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer2.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
