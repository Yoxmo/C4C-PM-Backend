const http = require('http');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path')
const crypto = require("crypto");

const User = mongoose.model('User', {
    name: {
        type: String
    },
    pass: {
        type: String
    },
    code: {
        type: String
    }
});

// +++++++++++++++ . +++++++++++++++ . +++++++++++++++ . +++++++++++++++ //

function createConnection() {
    mongoose.connect('mongodb+srv://c4c-pac-man:VUoMnRKE9XhU7xFv@cluster0.azeuqn4.mongodb.net/pac-man', {
            useNewUrlParser: true
        })
        .then(() => {
            console.log('[*] Connected to Pac-Man Database...')
        })
        .catch((err) => {
            console.log(`[!] There is not a problem.\nError: ${err}`);
            process.exit(-1)
        })

    return '[*] Express attached to database. '
}

function closeConnection() {
    mongoose.connection.close('error', err => {
        if (err) {
            return (err);
        } else {
            return '[!] Connection closing...'
        }
    });
}

function createCollection() {

    User.createCollection().then(() => {
            console.log('[*] Created collection users...')
        })
        .catch((err) => {
            console.log(`[!] There is not a problem.\nError: ${err}`);
            closeConnection()
        })

}

// +++++++++++++++ . +++++++++++++++ . +++++++++++++++ . +++++++++++++++ //

function createUser(username, pass) {

    User.findOne({
        name: username
    }, function(err, docs) {
        if (err) {
            console.log(err);
        } else {
            if (docs == null) {
                console.log("[-] Creating User...");

                const person = new Promise((resolve, reject) => {
                    var code = `        Welcome to C4C - PacMan [ ${username} ].\nHit the instruction button on your left to learn more!`
                    var user = new User({
                        name: username,
                        pass: pass,
                        code: code
                    });

                    user.save(function(err, user) {
                        if (err) {
                            reject("[-] Reject...");
                            return console.error(err)
                        }
                        console.log("[*] User: " + user.name + " saved to user collection.\n[-] Document ID: " + user.id);

                        resolve(user.id);

                    });
                });

                person.then(
                    (value) => {
                        //console.log(value); // [-] Success!
                    },
                    (reason) => {
                        //console.error(reason); // [-] Error!
                    },
                );
            } else {
                console.log('[-] User already exists... ');
                return '[*] User already exists...';
            }

        }
    });

    return '[*] Complete...';

}

function updateUser(username, pass, code, newpass) {

    const update = new Promise((resolve, reject) => {

        User.findOneAndUpdate({
            name: username
        }, {
            code: code
        }, {
            pass: pass
        }, function(err, docs) {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve('[-] Done')
                //console.log("Original Doc : ",docs);
            }
        });


    });

    update.then(
        (value) => {
            User.findOne({
                name: username
            }, function(err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("[*] Results saved.");
                }
            });
            console.log(value); // [-] Success!
            //return value
        },
        (reason) => {
            console.error(reason); // [-] Error!
            //return reason
        },
    );

    return '[*] Complete...';

}

function deleteeUser(username) {

    User.findOneAndRemove({
            user: username
        },
        function(err, docs) {
            if (err) {
                console.log(err)
            } else {
                console.log("[=] Removed User : ", docs.id);
            }
        });

    return '[*] Complete...';

}

// createConnection();
// createUser('Jacker' , 19 , 'derry');

//closeConnection();
// updateUser('Yordi' , 18 , code);


const app = express();
var db = createConnection();

app.use('/img', express.static(path.join(__dirname, '/assets/img')));
app.use('/js', express.static(path.join(__dirname, '/assets/js')));
app.use('/dist', express.static(path.join(__dirname, '/assets/dist')));
app.use('/css', express.static(path.join(__dirname, '/assets/css')));

app.use(express.json())
console.log(db);

// ==================== . [ GET PAGES] . ==================== //


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/account', (req, res) => {
    res.sendFile(__dirname + '/account.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

// ==================== . [ POST ENDP] . ==================== //

app.post('/code', function(req, res) {
    const {
        username
    } = req.body;
    let result;

    User.findOne({
        name: username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.send({
                err,
                username
            });
        } else {

            if (docs == null) {
                result = "[-] No User...";
                res.send({
                    result,
                    username
                });
            } else {
                if (docs.code) {
                    code = {
                        code: docs.code
                    }
                    res.send(code);
                } else {
                    //update()
                    code = {
                        code: '//\\\\ = Welcome to C4C-PacMan = \\\\//'
                    }
                    res.send(code);
                }
            }

        }
    });

});

app.post('/update', function(req, res) {
    const {
        username,
        userauth,
        code,
        pass,
        newpass
    } = req.body;
    const {
        authorization
    } = req.headers;

    let result;

    User.findOne({
        name: username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.send({
                err,
                username,
                authorization,
            });
        } else {

            if (docs == null) {
                result = "[-] No User...";
                res.send({
                    result,
                    username,
                    authorization,
                });
            } else {

                try{

                    if(userauth == docs.pass){
                        if(newpass != null && pass != null){
                            
                            const algorithm = 'aes-192-cbc';

                            const key = crypto.scryptSync(pass, 'GfG', 24);
                            const iv = Buffer.alloc(16, 0);
                            const cipher = crypto.createCipheriv(algorithm, key, iv);

                            const decipher = crypto.createDecipheriv(algorithm, key, iv);
                            let password = decipher.update(userauth, "hex", "utf-8");
                            password += decipher.final("utf8");

                            let encryptedPass = cipher.update(newpass, "utf-8", "hex");
                            encryptedPass += cipher.final("hex");

                            updateUser(username, password , code , encryptedPass)

                            result = '[*] Password Update Sucess!';

                            res.send({
                                result,
                                username,
                                userauth: encryptedPass,
                                authorization,
                            });

                        } else{
                            updateUser(username, userauth , code , userauth)
                            
                            result = '[*] Update Sucess!';

                            res.send({
                                result,
                                username,
                                userauth,
                                authorization,
                            });

                        }

                    } else{
                        result = '[!] Wrong Password...]';
    
                        res.send({
                            result,
                            username,
                            authorization,
                        });
                    }

                } 

                catch (error) {
                    result = `[!] Contact Support... ${error}`;
                    res.send({
                        result,
                        username,
                        authorization,
                    });
                }
            }

        }
    });

});


app.post('/delete', (req, res) => {
    const {
        username,
        password
    } = req.body;
    const {
        authorization
    } = req.headers;

    let result;

    User.findOne({
        name: username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.send({
                err,
                username,
                password,
                authorization,
            });
        } else {

            if (docs == null) {
                result = "[-] No User...";
                res.send({
                    result,
                    username,
                    password,
                    authorization,
                });
            } else {

                try{

                const algorithm = 'aes-192-cbc';

                const key = crypto.scryptSync(password, 'GfG', 24);
                const iv = Buffer.alloc(16, 0);
                const cipher = crypto.createCipheriv(algorithm, key, iv);


                let encryptedPass = cipher.update(password, "utf-8", "hex");
                encryptedPass += cipher.final("hex");

                if(encryptedPass == docs.pass){
                    result = '[*] Correct Password...';

                    deleteeUser(username);

                    res.send({
                        result,
                        username,
                        authorization,
                    });
                } else{
                    result = '[!] Wrong Password...]';

                    res.send({
                        result,
                        username,
                        authorization,
                    });
                }

                } catch (error) {
                    result = '[!] Wrong Password...';
                    res.send({
                        result,
                        username,
                        password,
                        authorization,
                    });
                }
            }

        }
    });

});

app.post('/login', (req, res) => {
    const {
        username,
        password
    } = req.body;
    const {
        authorization
    } = req.headers;

    let result;

    User.findOne({
        name: username
    }, function(err, docs) {
        if (err) {
            console.log(err);
            res.send({
                err,
                username,
                
                authorization,
            });
        } else {

            if (docs == null) {
                result = "[-] No User...";
                res.send({
                    result,
                    username,
                    authorization,
                });
            } else {

                try {

                    const algorithm = 'aes-192-cbc';

                    const key = crypto.scryptSync(password, 'GfG', 24);
                    const iv = Buffer.alloc(16, 0);
                    const cipher = crypto.createCipheriv(algorithm, key, iv);

                    // const decipher = crypto.createDecipheriv(algorithm, key, iv);
                    // let decryptedPass = decipher.update(docs.pass, "hex", "utf-8");
                    // decryptedPass += decipher.final("utf8");

                    //console.log("[*] Decrypted Pass: " + decryptedPass);

                    let encryptedPass = cipher.update(password, "utf-8", "hex");
                    encryptedPass += cipher.final("hex");
  
                    if(encryptedPass == docs.pass){
                        result = '[*] Correct Password...';

                        res.send({
                            result,
                            username,
                            userauth: encryptedPass,
                            authorization,
                        });
                    } else{
                        result = '[!] Wrong Password...]';

                        res.send({
                            result,
                            username,
                            authorization,
                        });
                    }

                } catch (error) {
                    result = '[-] Contact Support]';
                    res.send({
                        result,
                        username,
                        authorization,
                    });
                }
            }

        }
    });
});

app.post('/register', (req, res) => {
    const {
        username,
        password
    } = req.body;
    const {
        authorization
    } = req.headers;

    let result;
    try {
        const algorithm = 'aes-192-cbc';

        const key = crypto.scryptSync(password, 'GfG', 24);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
    
        let encryptedPass = cipher.update(password, "utf-8", "hex");
        encryptedPass += cipher.final("hex");
        //console.log("[*] Encrypted Pass: " + encryptedPass);
    
        console.log('[*] Creating User...');
    
        createUser(username, encryptedPass)
        result = '[*] Complete...';
        res.send({
            result,
            username,
            userauth: encryptedPass,
            authorization,
        });
    
    } catch (error) {
        result = '[*] Complete...';
        res.send({
            result,
            authorization,
        });
    }

});

// ==================== . [ 404 Page] . ==================== //

app.get('*', function(req, res) {
    res.status(404).sendFile(__dirname + '/404.html');
});



// ===============[ V ]=============== //


app.listen(8080, () => {
    console.clear()
    console.log(`
    ▐▓█▀▀▀▀▀▀▀▀▀█▓▌░▄▄▄▄▄░
    ▐▓█░PAC-MAN░█▓▌░█▄▄▄█░
    ▐▓█░░░░░░░░░█▓▌░█▄▄▄█░
    ▐▓█▄▄▄▄▄▄▄▄▄█▓▌░█████░
    ░░░░▄▄███▄▄░░░░░█████░

  `)
    console.log('[*] Express server active on port:  [ 8080 ]');
});