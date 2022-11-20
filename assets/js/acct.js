function checkLogin(){
    var checkLog =  localStorage.getItem('logged_in');
    if(checkLog == 'true'){

        window.location.replace('/')
    }
}
 
 var login = document.querySelector('#login')
 var regis = document.querySelector('#register')

 if(login) {
     login.addEventListener('click', (e) => {
          e.preventDefault();
          const username = document
              .querySelector('#user').value;
     
          const password = document
              .querySelector('#pass').value;
               
          fetch('/login', {
              method: 'POST',
              headers: {
                  Authorization: 'Bearer abcdxyz',
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  username,
                  password,
              }),
          })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
            if (data.result == '[*] Correct Password...') {
                localStorage.logged_in = true 
                localStorage.userauth = data.userauth
                localStorage.username = data.username
                window.location.reload();
            } else{
                alert(data.result);
            }
        });
      });
 }
 if(regis) {
    regis.addEventListener('click', (e) => {
        e.preventDefault();
        const username = document
            .querySelector('#user').value;
    
        const password = document
            .querySelector('#pass').value;
            
        fetch('/register', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer abcdxyz',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data);
                localStorage.logged_in = true 
                localStorage.userauth = data.userauth
                localStorage.username = data.username
                
                window.location.reload();
          });
    });
 }


checkLogin()