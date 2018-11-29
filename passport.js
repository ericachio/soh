/* https://scotch.io/tutorials/easy-node-authentication-setup-and-local */
/* learned from the tutorial above. */
const LocalStrategy = require('passport-local').Strategy;
const User = require('../db');

module.exports = function(passport){
    console.log("SUCCESS\n\n\n\n\n\n\n\n\n\n\n")
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

    passport.use('local-register', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) {
        process.nextTick(function() {
            User.findOne({ 'local.username' :  username }, function(err, user) {
                if (err){
                    return done(err);
                }
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'Sorry, username already taken! Pick another one.'));
                } else {
                    var newUser = new User();
                    newUser.local.username    = username;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.save(function(err) {
                        if (err){
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }

            });    

        });

    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done){
        User.findOne({'local.username' : username}, function(err, user){
            if(err){
                return done(err);
            }
            if(!user){
                return done(null, false, req.flash('loginMessage', 'Incorrect Username! Try Again'));
            }
            if(!user.validPassword(password)){
                return done(null, false, req.flash('loginMessage', 'Incorrect Password! Try Again'));
            }
            return done(null, user);
        });
    }));
};