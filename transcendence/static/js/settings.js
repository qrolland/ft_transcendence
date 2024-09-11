function selectAvatar(imageSrc, element) {
    const relativeUrl = new URL(imageSrc, window.location.origin).pathname;

    let prefixe = "/static";

    let newRelativeUrl = relativeUrl.replace(prefixe, "");

    // Enregistre l'image sélectionnée dans le champ caché
    document.getElementById('selected-avatar').value = newRelativeUrl;

    // Enregistre l'image sélectionnée dans le champ caché
    // document.getElementById('selected-avatar').value = imageSrc;

    // Retire la classe 'selected' de tous les avatars
    document.querySelectorAll('.avatar-container img').forEach(img => {
        img.classList.remove('selected');
    });

    // Ajoute la classe 'selected' à l'avatar actuel
    element.classList.add('selected');

    document.getElementById('profile_picture').value = '';
}

function unselectedAvatar() {
    document.getElementById('selected-avatar').value = '';
    document.querySelectorAll('.avatar-container img').forEach(img => {
        img.classList.remove('selected');
    });
}


document.addEventListener("DOMContentLoaded", function () {
    // Ajoutez des écouteurs d'événements aux images
    document.getElementById('avatar1').addEventListener('click', function () {
        selectAvatar('../images/avatar1.png', this);
    });

    document.getElementById('avatar2').addEventListener('click', function () {
        selectAvatar('../images/avatar2.png', this);
    });

    document.getElementById('avatar3').addEventListener('click', function () {
        selectAvatar('../images/avatar3.png', this);
    });

    document.getElementById('avatar4').addEventListener('click', function () {
        selectAvatar('../images/avatar4.png', this);
    });
});


document.getElementById('profile_picture').addEventListener('change', unselectedAvatar);

var settingsForm = document.getElementById('profile-form');

// Ajoutez un écouteur d'événements pour l'événement de soumission du formulaire
settingsForm.addEventListener('submit', function(event) {
    // Empêchez le comportement de soumission du formulaire par défaut
    event.preventDefault();

    // Appelez la fonction sendData() lorsque le formulaire est soumis
    sendForm();
});

function removeSelectedClass() {
    const selectedElement = document.querySelector('.avatar-container img.selected');
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
}

function sendForm() {

    // var formData = new FormData(document.getElementById('add-friends-form'));
    var crsfcookie = readCookie('csrftoken');
    // Utilisez Fetch pour envoyer les données au serveur
    fetch(getBaseUrl() + "/settings_update", {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Ajoutez ce header
        },
        body: new URLSearchParams(new FormData(settingsForm)),
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Ajout d'ami réussi, mettre à jour la page ou effectuer une redirection
                // window.location.reload(); // Rechargez la page (c'est une solution simple)
				urlRoute('/settings');
			} else {
                // Affichez un message d'erreur à l'utilisateur
                document.getElementById("message").style.opacity = "1";
                document.getElementById("message").textContent = "Failed to change username.";
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    removeSelectedClass();
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


async function	UploadProfilePicture(){
	var base_url = document.querySelector('meta[name="connexion"]').content;
	var file = document.getElementById("profile_picture");
	if (file.files.length == 0)
		return;
	var response = await fetch(base_url + "/upload_profile_picture", {
		method: "POST",
		credentials: 'same-origin',
		headers: {'Content-Type':  	' /json', 'X-CSRFToken' : readCookie('csrftoken')},
		body: file.files[0]
	});


}

async function saveSettings() {
    await UploadProfilePicture();
    sendForm();
}
