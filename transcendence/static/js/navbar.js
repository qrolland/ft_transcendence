var selector_box = document.getElementById("selector-box");
var main_nav = document.getElementById("main_nav");
var back_nav = document.getElementById("back_nav");
var menuItems = document.querySelectorAll('.menu-item');

function end_animation() {
	console.log("");
}

function hideNavItems() {
	for (let i = 0; i < menuItems.length; i++) {
		// menuItems[i].style.display = 'none';
		menuItems[i].hidden = true;
	}
}

function showNavItems() {
	for (let i = 0; i < menuItems.length; i++) {
		// menuItems[i].style.display = 'flex';
		menuItems[i].hidden = false;
	}
}



function hideNavbar() {
	main_nav.style.width = '0px';
	main_nav.style.opacity = '0';
	// main_nav.style.borderWidth = '0px';

	main_nav.addEventListener('transitionend', function transitionEnd(event) {
		if (event.propertyName === 'opacity') {
			if (main_nav.style.opacity == '0') {
				hideNavItems();
			}
			main_nav.removeEventListener('transitionend', transitionEnd);
		}
	});
}

function displayNavbar() {
	showNavItems();
	main_nav.style.width = '120px';
	// main_nav.style.borderWidth = '1px';
	main_nav.style.opacity = '1';
}


function displayBackNavbar(action = "hideBackNavbar(true);urlRoute('/game');") {
	hideNavbar();
	// main_nav.style.width = '90px';
	back_nav.style.borderWidth = '1px';
	document.querySelectorAll('#back_nav i').hidden = false;
	back_nav.style.width = '80px';
	back_nav.style.opacity = '1';
	back_nav.setAttribute('onclick', action);
}

function hideBackNavbar(display_navbar = false) {
	back_nav.style.width = '0px';
	back_nav.style.opacity = '0';
	back_nav.style.borderWidth = '0px';

	back_nav.addEventListener('transitionend', function transitionEnd(event) {
		if (event.propertyName === 'opacity') {
			if (back_nav.style.opacity == '0') {
				document.querySelectorAll('#back_nav i').hidden = true;
			}
			back_nav.removeEventListener('transitionend', transitionEnd);
		}
	});
	if (display_navbar == true) {
		displayNavbar();
	}
}

function updateNavbar(nClass) {
	for (let i = 1; i <= menuItems.length; i++) {
		if (nClass != i)
		{
			menuItems[i - 1].classList.remove('item-active');
		}

	}
	if (nClass != undefined) {
		menuItems[nClass - 1].classList.add('item-active');
		selector_box.style.marginTop = (nClass - 1) * 80 + 'px';
	}
	else
	{
		selector_box.style.display = 'none';
	}
}

menuItems.forEach((item) => {
    item.addEventListener('click', function() {
		let nClass = undefined;
		for (let i = 1; i <= menuItems.length; i++) {
			if (this.classList.contains('n-' + i))
				nClass = i;
		}
		for (let i = 1; i <= menuItems.length; i++) {
			if (nClass != i)
			{
				menuItems[i - 1].classList.remove('item-active');
			}

		}
		if (nClass != undefined) {
			menuItems[nClass - 1].classList.add('item-active');
			selector_box.style.display = 'block';
			selector_box.style.marginTop = (nClass - 1) * 80 + 'px';
		}
		else
		{
			selector_box.style.display = 'none';
		}
	});
});

hideBackNavbar(true);
