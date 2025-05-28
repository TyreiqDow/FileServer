var title = document.getElementById("title");
var setThemeDiv = document.getElementById("setTheme");
var presetThemesDiv = document.getElementById("presetThemesDiv");
var customThemesDiv = document.getElementById("customThemesDiv");


var emeraldGroveTheme = ["#1B4D3E", "#17B169", "#ACE1AF"];
var rusticEmberTheme = ["#273E47", "#BD632F", "#8A4035"];
var basicTheme = ["#fff", "#000", "#fff"];
var reverseTheme = ["#000", "#fff", "#000"];
var rubyTheme = ["#481414", "#9c3535", "#ff8585"];
var richLeatherTheme = ["#451911", "#da9e77", "#714f13 "];
var moonLight = ["#2e063d", "#982abc", "#b18cfe"];
var oceanTheme = ["#013A63 ", "#1E96FC ", "#88D8C0 "];
var blackOutTheme = ["#000", "#000 ", "#000 "];


var theme;







var files = [];
var folders = [];









window.onload = function() {

    // If there is not a theme, create one in local storage and set it to Rustic Ember
    if(!localStorage.getItem("theme")) {
        localStorage.setItem("theme", rusticEmberTheme);
        theme = localStorage.getItem("theme");
        console.log(localStorage.getItem("theme"));
        //alert(theme);
    } else {
        theme = localStorage.getItem("theme");
        console.log(localStorage.getItem("theme"));
        //alert(theme);
    }

    var r = document.querySelector(':root');
    theme = theme.split(',');


    r.style.setProperty('--color1', theme[0]);
    r.style.setProperty('--color2', theme[1]);
    r.style.setProperty('--color3', theme[2]);






    //      /\/\
    //      | |
    //
    //      FRONT END CODE ABOVE
    //
    //      



    //
    //
    //      BACK END CODE ABOVE
    //      | |
    //      \/\/





    fetch('http://10.0.0.22:5000/files')
    .then(response => response.json())
    .then(data => {
        console.log('Files:', data);

        files = data[0];
        folders = data[1];

        console.log("Files: " + files);
        console.log("Folders: " + folders);

        
        
        var dataDiv = document.getElementById("data");




        for(let file in files) {
            let fileName = files[file];
            console.log(fileName);
            dataDiv.appendChild(createMediaDiv(fileName));
        }



        let folderName = "";
        let fileNames = [];

        for(var i=0; i<folders.length; i+=2) {

            console.log(i);
            console.log(folders[i]);
            console.log(folders[i+1]);


            if(typeof folders[i] === "string") {
                folderName = folders[i];
                let array = folders[i+1];
                fileNames = array[0];

                console.log(folderName);
                console.log(fileNames);

            

                dataDiv.appendChild(createFolder(folderName, fileNames));

                folderName = "";
                fileNames = [];
            }
            

        }






        for (var j = 0; j < dataDiv.getElementsByClassName("downloadBtn").length; j++) {
            dataDiv.getElementsByClassName("downloadBtn")[j].onclick = function() {

                var fileName = this.previousElementSibling.textContent;
                console.log("Pressed" + fileName);

                fetch('http://10.0.0.22:5000/download/' + fileName)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });

            };
        }






















        for (var z = 0; z < dataDiv.getElementsByClassName("fileName").length; z++) {
            dataDiv.getElementsByClassName("fileName")[z].onclick = function() {

                var fileName = this.textContent;
                console.log("Pressed" + fileName);

                if(alert("Are you sure you want to delete " + fileName + "? This action cannot be undone.") == false) return;

                fetch('http://10.0.0.22:5000/delete/' + fileName)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    console.log('File deleted:', data);
                    location.reload();
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });

            };
        }
         
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    




}

















function showORhideThemes() {
    if(setThemeDiv.style.display === "none") {
        setThemeDiv.style.display = "flex";
    } else {
        setThemeDiv.style.display = "none";
    }
    
}



function showPresetThemes() {
    customThemesDiv.style.display = "none";
    presetThemesDiv.style.display = "block";
}


function showCustomThemes() {
    presetThemesDiv.style.display = "none";
    customThemesDiv.style.display = "block";
}



function setPresetTheme() {
    let theme = document.getElementById("themes").value;


    if(theme == "Emerald Grove") {theme = emeraldGroveTheme;}
    if(theme == "Rustic Ember") {theme = rusticEmberTheme;}
    if(theme == "Basic") {theme = basicTheme;}
    if(theme == "Reverse") {theme = reverseTheme;}
    if(theme == "Ruby") {theme = rubyTheme;}
    if(theme == "Rich Leather") {theme = richLeatherTheme;}
    if(theme == "moonLight") {theme = moonLight;}
    if(theme == "Ocean") {theme = oceanTheme;}
    if(theme == "Black Out") {theme = blackOutTheme;}




    localStorage.setItem("theme", theme);
    location.reload();
}



function setCustomTheme() {
    let backgroundColor = document.getElementById("backgroundColorInput").value;
    let mainColor = document.getElementById("mainColorInput").value;
    let secondaryColor = document.getElementById("secondaryColorInput").value;

    let theme = [backgroundColor, mainColor, secondaryColor];


    localStorage.setItem("theme", theme);
    location.reload();
}




















/*

div  .data #data
    div.media
        p.fileName
        button.downloadBtn


    div.folder
        p.folder-name
        div.media
            p.fileName
            button.downloadBtn

*/


var dataDiv = document.getElementById("data");





function uploadMedia() {
    // Get current file input data
    var fileInput = document.getElementById("file");
    console.log(fileInput.files);

    // Create a FormData object to send the files
    var formData = new FormData();

    // Append each file to the formData
    for (var i = 0; i < fileInput.files.length; i++) {
        formData.append("files", fileInput.files[i]);
    }



    fetch('http://10.0.0.22:5000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });


    location.reload();
}








function uploadFolder() {
    // Get current file input data
    var fileInput = document.getElementById("folder-files");
    var folderName = document.getElementById("folder-name").value;
    console.log(fileInput.files, folderName);

    // Create a FormData object to send the files
    var formData = new FormData();


    formData.append("folderName", folderName);

    // Append each file to the formData
    for (var i = 0; i < fileInput.files.length; i++) {
        formData.append("files", fileInput.files[i]);
    }


    

    fetch('http://10.0.0.22:5000/uploadFolder', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });


    //location.reload();
}
















function createMediaDiv(fileName) {
    let div = document.createElement("div");
    div.className = "media";
    
    let p = document.createElement("p");
    p.className = "fileName";
    p.textContent = fileName;
    
    let button = document.createElement("button");
    button.className = "downloadBtn";
    button.textContent = "Download";
    
    div.appendChild(p);
    div.appendChild(button);
    
    return div;
}



function createFolder(folderName, fileNames) {
    let folder = document.createElement("div");
    folder.className = "folder";
    

    let p = document.createElement("p");
    p.className = "folder-name";
    p.textContent = folderName;
    folder.appendChild(p);


    for(let file in fileNames) {
        let name = fileNames[file];
        console.log("Creating div"+name);
        let div = createMediaDiv(name);
        folder.appendChild(div);
    }
    
    

    return folder;
}