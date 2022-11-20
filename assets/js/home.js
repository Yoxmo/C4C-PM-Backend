
function checkLogin(){
   var checkLog =  localStorage.getItem('logged_in');
   if(checkLog != 'true'){
        window.location.replace('login')
   }
}

function turnOn(id) {
    document.getElementsByClassName('container')[0].style.display = 'none';
    document.getElementById(id).style.display = '';
}

function turnOff(id) {
    document.getElementsByClassName('container')[0].style = '';
    document.getElementById(id).style.display = 'none';
}



function saveCode() {
    var code = document.querySelector('.cm-content').innerText;

    fetch('/update', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer abcdxyz',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: localStorage.username,
            userauth: localStorage.userauth,
            code: code,
            newpass: null
        }),
     })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            console.log(data);
      });

    return code
}


function loadcode(username) {
    fetch('/code', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer abcdxyz',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username
        }),
    })
      .then((res) => {
          return res.json();
      })
      .then((data) => {
        if(data != '[-] No User...'){
            loading = data.code.toString().split('\n').reverse();
            loading.forEach((item)=> {
                var tableRow = document.querySelector('.cm-line');
                var tableRowClone = tableRow.cloneNode(true);
                tableRowClone.innerText = item;
                tableRow.parentNode.insertBefore(tableRowClone, tableRow.nextSibling);
            });
        }
  });
}

checkLogin()
loadcode(localStorage.username)
// function music(onf) {
// 	document.getElementById("myAudio").play(); 
// }