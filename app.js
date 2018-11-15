require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// ---------------------------------------------------

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const $ = require('jquery');
var request = require("request");

// ---------------------------------------------------

const app = express();
const mongoose = require('mongoose');

// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

// passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------
//passport app

app.get('/login', function(req, res){
	res.render('login', {message: req.flash('loginMessage')});
});

app.post('/login', passport.authenticate('local-login', {
	successRedirect: '/homepage',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/register', function(req, res){
	res.render('register', {message: req.flash('signupMessage')});
});

app.post('/register', passport.authenticate('local-register', {
	successRedirect: '/homepage',
	failureRedirect: '/register',
	failureFlash : true
}));

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
};

// ---------------------------------------------------


app.listen(process.env.PORT || 3000);