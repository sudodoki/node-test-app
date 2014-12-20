'use strict';

var express = require('express'),
    app = express(),
    port = 8080;

app.get('*', function(req, res) {
  res.end('Hello world!');
});

app.listen(port);
console.log('App is running on %s port', port);
