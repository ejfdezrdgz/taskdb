var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var body_parser = require('body-parser');
var cookie_session = require('cookie-session');

var app = express();
var server = app.listen(3000, function () {
    console.log('Servidor web iniciado');
});
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'apptareas'
});

connection.connect(function (error) {
    if (error) {
        throw error;
    } else {
        console.log('Conexión exitosa');
    }
});

app.use(express.static('www'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cookie_session({
    name: 'session',
    keys: ['SID'],
    maxAge: 24 * 60 * 60 * 1000
}));

// Endpoints

app.get('/', function (req, res) {
    if (req.session.user != null) {
        res.redirect('/home');
    } else {
        fs.readFile('./html/login.html', 'utf8', function (err, text) {
            res.send(text);
        });
    }
});

app.post('/', function (req, res) {
    connection.query('SELECT * FROM `users` WHERE nick=? AND pass=?', [req.body.nick, req.body.pass], function (err, result) {
        if (err) {
            throw err;
        } else {
            if (result.length > 0) {
                req.session.uid = result[0].id;
                req.session.name = result[0].name;
                req.session.user = req.body.nick;
                res.redirect('/home');
            } else {
                fs.readFile('./html/login.html', 'utf8', function (err, text) {
                    text = text.replace('class="hideerror">[loginerror]', 'class="showerror">User or password incorrect');
                    res.send(text);
                });
            };
        };
    });
});

app.get('/home', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query('SELECT id, name FROM users', function (err, result) {
        fs.readFile('./html/home.html', 'utf8', function (err, text) {
            text = text.replace('[username]', req.session.name);
            res.send(text);
        });
    });
});

app.get('/logout', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    req.session = null;
    res.redirect('/home');
});

app.get('/signup', function (req, res) {
    fs.readFile('./html/signup.html', 'utf8', function (err, text) {
        res.send(text);
    });
});

app.post('/signup', function (req, res) {
    connection.query("INSERT INTO users (name, nick, pass, mail) VALUES (?, ?, ?, ?)", [req.body.name_signup, req.body.nick_signup, req.body.pass1_signup, req.body.mail_signup], function (err, result) {
        res.send('User created succesfully');
    });
});

app.get('/userinfo', function (req, res) {
    
});

app.post('/userinfo', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query("SELECT * FROM users WHERE id=?", [req.session.uid], function (err, result) {
        if (err) {
            throw err;
        } else {
            var uinfo = {
                uid = result[0].id,
                uname = result[0].name,
                unick = result[0].nick,
                umail = result[0].mail
            };
            res.send(JSON.stringify(uinfo));
        };
    });
});

// Functions

function cookieChecker(req, res) {
    if (req.session.user == null) {
        res.redirect('/');
        return true;
    }
    return false;
};