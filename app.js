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
const threeStrengths = mongoose.model('threeStrengths');
const threeWeaknesses = mongoose.model('threeWeaknesses');

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
	res.render('index');
});

//homepage after logged in 
app.get('/homepage', isLoggedIn, function(req, res) {
	res.render('homepage');
	// Strengths.find((err, resultOfQuery) =>{
	// 	let result = resultOfQuery.filter((x) => {
	// 		if (x.username === req.user.local.username){
	// 			return x;
	// 		}	
	// 	});
	// 	if (result === null){
	// 		let m = "No Strengths Saved, Add Them";
	// 		res.render('homepage', {user: req.user, message: m});
	// 	}else{
	// 		res.render('homepage', {user: req.user, message: result});
	// 	}
	
	// });
	// Weaknesses.find((err, resultOfQuery) =>{
	// 	let result = resultOfQuery.filter((x) => {
	// 		if (x.username === req.user.local.username){
	// 			return x;
	// 		}	
	// 	});
	// 	if (result === null){
	// 		let m = "No Strengths Saved, Add Them";
	// 		res.render('homepage', {user: req.user, message: m});
	// 	}else{
	// 		res.render('homepage', {user: req.user, music: result});
	// 	}
		
	// });
});

// app.post('/homepage', isLoggedIn, function(req, res) {
// 	if (req.body.title.length > 2 && req.body.artist.length > 2 ){
// 		new Strength({
// 			title: req.body.title, 
// 			artist: req.body.artist,
// 			username: req.user.local.username
// 		}).save(function(){
// 			res.redirect('/homepage');
// 		});
// 	}
// 	// else if (req.body.toDelete !== undefined){
// 	// 	let del = req.body.toDelete;
// 	// 	del = del.toString();
// 	// 	del = del.split(',');
// 	// 	del.map((obj) => {
// 	// 		Song.remove({ "_id": obj}, function(err){
// 	// 		});
// 	// 	});
// 	// 	res.redirect('/homepage');	
// 	// }
// });

//profile
app.get('/profile', isLoggedIn, function(req, res) {
	User.findOne({"_id":req.user.id} , (err, resultOfQuery) =>{
		let m1 = "no top strengths added!";
		let s1, s2, s3 = "";
		if (resultOfQuery.Strengths.length > 0){
			m1 = "top three strengths";
			s1 = resultOfQuery.Strengths[0].first;
			s2 = resultOfQuery.Strengths[0].second;
			s3 = resultOfQuery.Strengths[0].third;
		}
		let m2 = "no lowest strengths added!";
		let w1, w2, w3 = "";
		if (resultOfQuery.Weaknesses.length > 0){
			m2 = "lowest three strengths";
			w1 = resultOfQuery.Weaknesses[0].first;
			w2 = resultOfQuery.Weaknesses[0].second;
			w3 = resultOfQuery.Weaknesses[0].third;
		}
		res.render('profile', {message1: m1, firstS: s1, secondS: s2, thirdS: s3, message2: m2, firstW: w1, secondW: w2, thirdW: w3});
	});
});

//have yet to think of a way to make it so you can edit one weakness/strength instead of adding
//probably $set, not $push 
app.get('/mystrengths', isLoggedIn, function(req, res) {
	res.render('strengthsedit');
});

app.post('/mystrengthsedit', isLoggedIn, function(req, res) {
	if (req.body.firstStrength.length > 2 && req.body.secondStrength.length > 2 && req.body.thirdStrength.length > 2){
		new Strengths({
			first: req.body.firstStrength, 
			second: req.body.secondStrength,
			third: req.body.thirdStrength,
			username: req.user.local.username
		}).save((err,result) => {
			User.findOneAndUpdate({"_id":req.user.id}, {$push: {Strengths: result}}, (err) => {
				res.redirect('/profile');
			});	
					// res.redirect('/profile');
		});
	}
});

app.get('/myweaknesses', isLoggedIn, function(req, res) {
	// User.findOne({"_id":req.user.id} , (err, resultOfQuery) =>{
	// 	let m2 = "no lowest strengths added!, fill out all three blanks!";
	// 	if (resultOfQuery.Weaknesses.length > 0){
	// 		m2 = "lowest three strengths: ";
	// 		m2 += resultOfQuery.Weaknesses[0].first + ", ";
	// 		m2 += resultOfQuery.Weaknesses[0].second + ", ";
	// 		m2 += resultOfQuery.Weaknesses[0].third + " fill out which strength you want to edit!";
	// 	}
	// 	res.render('weaknessesedit', {message: m2});
	// });
	res.render('weaknessesedit');
});

app.post('/myweaknessesedit', isLoggedIn, function(req, res) {
	if (req.body.firstWeakness.length > 2 && req.body.secondWeakness.length > 2 && req.body.thirdWeakness.length > 2){
		new Weaknesses({
			first: req.body.firstWeakness, 
			second: req.body.secondWeakness,
			third: req.body.thirdWeakness,
			username: req.user.local.username
		}).save((err,result) => {
			User.findOneAndUpdate({"_id":req.user.id}, {$push: {Weaknesses: result}}, (err) => {
				res.redirect('/profile');
			});	
					// res.redirect('/profile');
		});
	}
});
app.listen(process.env.PORT || 3000);