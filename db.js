// 1ST DRAFT DATA MODEL

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const URLSlugs = require('mongoose-url-slugs');

// users
// have a username and password
const User = new mongoose.Schema({
	local: {
		username: String,
  		password: String,
	},
	
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

Playlist.plugin(URLSlugs('name'));

// mongoose.model('User', User);
module.exports = mongoose.model('User', User);



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
 dbconf = 'mongodb://localhost/finalprojconfig';
}

mongoose.connect(dbconf);
