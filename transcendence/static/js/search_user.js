
async function searchTop(username){
	await searchUser(username);
}

async function searchUser(username="None"){
	var profile_searched = username;
	if (username == "None"){
		var search_box = document.getElementById("search_username");
		profile_searched = search_box.value;
	}
	var url = getBaseUrl() + "/userexist/" + profile_searched;
	var response = await fetch(url,{
		method : "GET"
		}
	);
	response = await response.json();
	if (response["user_exist"] == "True"){
		await urlRoute("/profile/" + profile_searched);
	}

	else{
		try{
			document.getElementById("search_username").style.border = "3px solid red";
		}
		catch (error){
			;
		}
	}
}