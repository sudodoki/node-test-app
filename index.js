'use strict';

var express = require('express'),
    path = require('path'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    LeveldbStore = require('connect-leveldb')(session),
    app = express(),
    bodyParser = require('body-parser'),
    port = 8080;


var HARDCODED_USERS = [
  { id: 1, username: 'admin', password: 'admin', email: 'admin@this.shit' }
];

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  var user = HARDCODED_USERS.filter(function (u) { return u.id === id; });
  if (!user) { return done(new Error('User does not exist')); }
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = HARDCODED_USERS.filter(function (u) {
      return u.username === username;
    })[0];
    if (user && user.password === password) {
      return process.nextTick(function () {
        done(null, user);
      });
    }
    return process.nextTick(function () {
      done(null, false);
    });
  }
));




app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  store: new LeveldbStore({ dbLocation: __dirname + '/db' }),
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res) {
  res.render('login.html');
});

app.post('/login',
  function (req, res, next) {
    console.log(req.body);
    next();
  },
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/',
  ensureAuthenticated,
  function(req, res) {
  res.end('Hello world!');
});

app.listen(port);
console.log('App is running on %s port', port);
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}