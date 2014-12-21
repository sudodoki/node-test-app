'use strict';

var express = require('express'),
    path = require('path'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    LeveldbStore = require('connect-leveldb')(session),
    app = express(),
    bodyParser = require('body-parser'),
    port = 8080,
    GITHUB_CLIENT_ID = '14c495435d08a41b588d',
    GITHUB_CLIENT_SECRET = 'eb9aea97ab08eb9a22f9b94900770c2beaf434be';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8080/auth/github/callback'
},
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }));

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
  res.render('login.html', {user: req.user });
});

app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res) {
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res) {
  req.logout();
  console.log('loggint out');
  res.redirect('/');
});

app.get('/',
  ensureAuthenticated,
  function(req, res) {
  res.end('Hello world!');
});

app.get('/account', ensureAuthenticated, function(req, res) {
  res.render('user.html', {user: req.user});
});

app.listen(port);
console.log('App is running on %s port', port);
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
