// 1ST DRAFT DATA MODEL

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const URLSlugs = require('mongoose-url-slugs');

const Strengthobj = new mongoose.Schema({
  name: String, 
  description: String,
  exercises: String
});


const Strengths = new mongoose.Schema({
  first: String,
  second: String,
  third: String,
  username: String
});


const Weaknesses = new mongoose.Schema({
  first: String,
  second: String,
  third: String,
  username: String
});

const Progress = new mongoose.Schema({
  username: String,
  characterstrength: String,
  helpful: String,
  again: String,
  carryover: String,
  carryovercomment: String,
  friend: String,
  extracomment: String
});


// users
// have a username and password
const User = new mongoose.Schema({
	local: {
		username: String,
  		password: String,
	},
	Strengths: Strengths,
	Weaknesses: Weaknesses,
  Progress: [Progress]
});

// methods ======================
// generating a hash
User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// TODO: add remainder of setup for slugs, connection, registering models, etc. below

// mongoose.model('User', User);
module.exports = mongoose.model('User', User);
mongoose.model('Strengths', Strengths);
mongoose.model('Weaknesses', Weaknesses);
mongoose.model('Strengthobj', Strengthobj);
mongoose.model('Progress', Progress);

//UNSURE IF NEED THIS 
// ---------------------------------------------------

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 //dbconf = 'mongodb://localhost/sohfinalprojconfig';
 dbconf = 'mongodb://erica:721ericachio@ds044577.mlab.com:44577/soh';
}

mongoose.connect(dbconf, { useNewUrlParser: true });

//____________________________________________________
// if (process.env.NODE_ENV === 'PRODUCTION') {
//  // if we're in PRODUCTION mode, then read the configration from a file
//  // use blocking file io to do this...
//  const fs = require('fs');
//  const path = require('path');
//  const fn = path.join(__dirname, 'config.json');
//  const data = fs.readFileSync(fn);

//  // our configuration file will be in json, so parse it and set the
//  // conenction string appropriately!
//  const conf = JSON.parse(data);
//  dbconf = conf.dbconf;
//  mongoose.connect(dbconf, { useNewUrlParser: true });
// } else {
    //lets require/import the mongodb native drivers.
    // var mongodb = require('mongodb');

    // //We need to work with "MongoClient" interface in order to connect to a mongodb server.
    // var MongoClient = mongodb.MongoClient;

    // // Connection URL. This is where your mongodb server is running.

    // //(Focus on This Variable)
    // var url = 'mongodb://erica:721ericachio@ds044577.mlab.com:44577/soh';      
    // //(Focus on This Variable)
    // // Use connect method to connect to the Server
    //   MongoClient.connect(url, function (err, db) {
    //   if (err) {
    //     console.log('Unable to connect to the mongoDB server. Error:', err);
    //   } else {
    //     console.log('Connection established to', url);

    //     // do some work here with the database.

    //     //Close connection
    //     //db.close();
    //   }
    // });
//}











