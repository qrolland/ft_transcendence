




async function insert_img(node, img_name){
	var img = await fetchBlob(getBaseUrl() + "/profile_image/" + img_name);
	var url = URL.createObjectURL(img);
	node.src = url;
}

async function fetchBlob(url) {
    const response = await fetch(url,{
		method: 'GET'
	});
    return response.blob();
}


async function fetchAllImg(){
	
	var img = document.querySelectorAll(".profile-img");
	for (var i = 0; i < img.length; i++){
		if (img[i].id == "invited"){
			continue;
		}
		await insert_img(img[i], img[i].id);
		
	}
}