var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var body_parser = require('body-parser');

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

// Endpoints

app.get('/', function (req, res) {
    fs.readFile('./html/login.html', 'utf8', function (err, text) {
        res.send(text);
    });
    console.log('Acceso a endpoint ROOT');
});

app.get('/login', function (req, res) {
    res.redirect('/');
    console.log('Acceso a endpoint LOGIN');
});

app.get('/signup', function (req, res) {
    fs.readFile('./html/signup.html', 'utf8', function (err, text) {
        res.send(text);
    });
    console.log('Acceso a endpoint SIGNUP');
});

app.post('/signup', function (req, res) {
    res.send('Hola, ' + req.body.name_signup);
});