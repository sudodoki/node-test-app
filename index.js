'use strict';

var express = require('express'),
    path = require('path'),
    app = express(),
    port = 8080;

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.get('/login', function(req, res) {
  res.render('login.html');
});

app.listen(port);
console.log('App is running on %s port', port);
