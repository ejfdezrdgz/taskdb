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

const SELECT_TASKS = 'SELECT tasks.id, title, description, usr1.name as author, usr2.name as executor, date, status FROM tasks, users as usr1, users as usr2 WHERE author=usr1.id AND executor=usr2.id AND status=1';
const SELECT_TASKSID = 'SELECT tasks.id, title, description, usr1.name as author, usr1.id as authid, usr2.name as executor, usr2.id as execid, date, status FROM tasks, users as usr1, users as usr2 WHERE author=usr1.id AND executor=usr2.id AND status=1';
const SELECT_TASK_AND_USERS = 'SELECT tasks.id as taskid, title, description as tdesc, author as authid, executor as execid, users.id as uid, name as uname FROM tasks RIGHT JOIN users ON executor = users.id AND tasks.id=?';

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
    maxAge: 12 * 60 * 60 * 1000
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
    connection.query('SELECT * FROM users WHERE nick=? AND pass=?', [req.body.nick, req.body.pass], function (err, result) {
        if (err) {
            throw err;
        } else {
            if (result.length > 0) {
                req.session.uid = result[0].id;
                req.session.name = result[0].name;
                req.session.user = req.body.nick;
                req.session.avatar = result[0].avatar;
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

app.post('/addtask', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query('INSERT INTO tasks (title, description, author, executor, date) VALUES (?,?,?,?,?)', [req.body.titl, req.body.desc, req.session.uid, req.body.exec, req.body.date], function (error, result) {
        connection.query('SELECT * FROM tasks', function (err, resp) {
            if (err) {
                throw err;
            } else {
                if (error) {
                    list = { status: 0, taskid: null, tasks: resp };
                } else {
                    list = { status: 1, taskid: result.insertId, tasks: resp };
                };
                res.send(JSON.stringify(list));
            };
        });
    });
});

app.get('/complete/:id?', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query(`UPDATE tasks SET status=2 WHERE id=${req.query.id}`, function (err, result) {
        let qresp = {};
        connection.query(SELECT_TASKS, function (error, response) {
            if (err) {
                throw err;
                qresp = {
                    status: 0,
                    tasks: response
                };
            } else {
                qresp = {
                    status: 1,
                    tasks: response
                };
            };
            res.send(JSON.stringify(qresp));
        });
    });
});

app.get('/delete/:id?', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query(`UPDATE tasks SET status=0 WHERE id=${req.query.id}`, function (err, result) {
        let qresp = {};
        connection.query(SELECT_TASKS, function (error, response) {
            if (err) {
                throw err;
                qresp = {
                    status: 0,
                    tasks: response
                };
            } else {
                qresp = {
                    status: 1,
                    tasks: response
                };
            };
            res.send(JSON.stringify(qresp));
        });
    });
});

app.get('/edit/:id?', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    let data = {
        users: []
    };
    connection.query(SELECT_TASK_AND_USERS, [req.query.id], function (err, result) {
        if (err) {
            throw err;
        } else {
            result.forEach(element => {
                if (element.taskid) {
                    data.task = {
                        tid: element.taskid,
                        titl: element.title,
                        tdesc: element.tdesc,
                        tauth: element.authid,
                        texec: element.execid
                    }
                }
                if (element.uid) {
                    let user = {
                        uid: element.uid,
                        uname: element.uname
                    }
                    data.users.push(user);
                }
            });
        }
        res.send(JSON.stringify(data));
    });
});

app.post('/edit', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query(`UPDATE tasks SET title=?, executor=?, description=? WHERE id=${req.body.taskid}`, [req.body.titl, req.body.exec, req.body.desc], function (error, result) {
        connection.query('SELECT * FROM tasks', function (err, resp) {
            if (err) {
                throw err;
            } else {
                if (error) {
                    list = { status: 0, taskid: null, tasks: resp };
                } else {
                    list = { status: 1, taskid: result.insertId, tasks: resp };
                };
                res.send(JSON.stringify(list));
            };
        });
    });
});

app.get('/home', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query('SELECT id, name FROM users', function (err, result) {
        fs.readFile('./html/home.html', 'utf8', function (err, text) {
            text = text.replace('[username]', req.session.name);
            if (req.session.avatar != '') {
                avatar = req.session.avatar;
                text = text.split('[avatarsrc]').join(avatar);
            } else {
                text = text.split('[avatarsrc]').join('');
            };
            connection.query('SELECT * FROM users', function (err, result) {
                let selection = '';
                if (err) {
                    throw err;
                } else {
                    result.forEach(element => {
                        selection += `
                        <option value="${element.id}">${element.name}</option>`;
                    });
                }
                text = text.split('[selector]').join(selection);
                res.send(text);
            });
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

app.post('/reload', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query(SELECT_TASKSID, function (err, result) {
        result.forEach(element => {
            var d = new Date(String(element.date));
            function pad(s) { return (s < 10) ? '0' + s : s; };
            var formatDate = [pad(d.getDate()), pad(d.getMonth() + 1), pad(d.getFullYear())].join('/');
            element.date = formatDate;
            if (req.session.uid != element.authid && req.session.uid != element.execid) {
                element.permission = 0;
            };
            if (req.session.uid == element.authid && req.session.uid != element.execid) {
                element.permission = 1;
            };
            if (req.session.uid != element.authid && req.session.uid == element.execid) {
                element.permission = 2;
            };
            if (req.session.uid == element.authid && req.session.uid == element.execid) {
                element.permission = 3;
            };
        });
        res.send(JSON.stringify(result));
    });
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
    if (cookieChecker(req, res)) {
        return;
    };
    connection.query("SELECT * FROM users WHERE id=?", [req.session.uid], function (err, result) {
        if (err) {
            throw err;
        } else {
            var uinfo = {
                uid: result[0].id,
                uname: result[0].name,
                unick: result[0].nick,
                umail: result[0].mail,
            };
            // setTimeout(function () {
            //     res.send(JSON.stringify(uinfo));
            // }, 5000);
            res.send(JSON.stringify(uinfo));
        };
    });
});

app.post('/userinfo', function (req, res) {
    if (cookieChecker(req, res)) {
        return;
    };
    let image = req.body.avatar;
    let base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    let name = './www/resources/avatars/img_' + req.session.user + '.jpg';
    fs.writeFile(name, base64Data, 'base64', function (err) { });
    if (req.body.pass == '') {
        res.send('nok');
    } else {
        connection.query("UPDATE users SET name=?, pass=?, mail=?, avatar=?  WHERE id=?", [req.body.name, req.body.n1pass, req.body.mail, req.body.avatar, req.session.uid], function (err, result) {
            if (result.affectedRows > 0) {
                res.send('ok');
            } else {
                res.send('nok');
            };
        });
    };
});

// Functions

function cookieChecker(req, res) {
    if (req.session.user == null) {
        res.redirect('/');
        return true;
    }
    return false;
};