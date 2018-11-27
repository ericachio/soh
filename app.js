require('./db'); //for mongoose

// jevons, in terminal: 
// npm install express 
// npm install hbs 
// npm install views 
// npm install express-session
// npm install passport
// npm install passport-local
// npm install connect-flash
// npm install cookie-parser
// npm install morgan 
// npm install jquery
// npm install request
// npm install mongoose
// npm install bcrypt-nodejs
// npm install mongoose-url-slug
// node app.js
// curl -i localhost:3000

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
mongoose.set('useFindAndModify', false);

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

const Strengths = mongoose.model('Strengths');
const Weaknesses = mongoose.model('Weaknesses');
const User = mongoose.model('User');

var string1 = "name";
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

//page to login
app.get('/', function(req, res){
	if(req.isAuthenticated()){
		res.render('homepage');	
	}
	else{
		res.render('index');
	}
	
});

//homepage after logged in 
app.get('/homepage', isLoggedIn, function(req, res) {
	res.render('homepage');
});

//profile
app.get('/profile', isLoggedIn, function(req, res) {
	User.findOne({"_id":req.user.id} , (err, resultOfQuery) =>{
		let m1 = "no top strengths added!";
		let s1, s2, s3 = "";
		if (resultOfQuery.Strengths !== undefined){
			m1 = "top three strengths";
			s1 = resultOfQuery.Strengths.first;
			s2 = resultOfQuery.Strengths.second;
			s3 = resultOfQuery.Strengths.third;
		}
		let m2 = "no lowest strengths added!";
		let w1, w2, w3 = "";
		if (resultOfQuery.Weaknesses !== undefined){
			m2 = "lowest three strengths";
			w1 = resultOfQuery.Weaknesses.first;
			w2 = resultOfQuery.Weaknesses.second;
			w3 = resultOfQuery.Weaknesses.third;
		}
		res.render('profile', {message1: m1, firstS: s1, secondS: s2, thirdS: s3, message2: m2, firstW: w1, secondW: w2, thirdW: w3});
	});
});

app.get('/mystrengths', isLoggedIn, function(req, res) {
	res.render('strengthsedit');
});

app.post('/mystrengthsedit', isLoggedIn, function(req, res) {

	if (req.body.firstStrength.length >= 2 && req.body.secondStrength.length >= 2 && req.body.thirdStrength.length >= 2 && noRepetition(req.body.firstWeakness, req.body.secondWeakness, req.body.thirdWeakness)){
		new Strengths({
			first: req.body.firstStrength, 
			second: req.body.secondStrength,
			third: req.body.thirdStrength,
			username: req.user.local.username
		}).save((err,result) => {
			User.findOneAndUpdate({"_id":req.user.id}, {$set: {Strengths: result}}, (err) => {
				res.redirect('/profile');
			});	
		});
	}else{
		if(!noRepetition(req.body.firstWeakness, req.body.secondWeakness, req.body.thirdWeakness)){
			res.render('strengthsedit', {error: "please choose three UNIQUE options"});
		}
		else{
			res.render('strengthsedit', {error: "please choose ALL three options"});
		}
	}
});

app.get('/myweaknesses', isLoggedIn, function(req, res) {
	res.render('weaknessesedit');
});

app.post('/myweaknessesedit', isLoggedIn, function(req, res) {
	if (req.body.firstWeakness.length >= 2 && req.body.secondWeakness.length >= 2 && req.body.thirdWeakness.length >= 2 && noRepetition(req.body.firstWeakness, req.body.secondWeakness, req.body.thirdWeakness)){
		new Weaknesses({
			first: req.body.firstWeakness, 
			second: req.body.secondWeakness,
			third: req.body.thirdWeakness,
			username: req.user.local.username
		}).save((err,result) => {
			User.findOneAndUpdate({"_id":req.user.id}, {$set: {Weaknesses: result}}, (err) => {
				res.redirect('/profile');
			});	
		});
	}else{
		if(!noRepetition(req.body.firstWeakness, req.body.secondWeakness, req.body.thirdWeakness)){
			res.render('weaknessesedit', {error: "please choose three UNIQUE options"});
		}
		else{
			res.render('weaknessesedit', {error: "please choose ALL three options"});
		}
	}
});
app.listen(process.env.PORT || 3000);


function noRepetition(s, s2, s3){
	if(s === s2 || s2===s3 || s2 === s3) return false;
	else return true;
}