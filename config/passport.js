const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const config = require('./secret');
const User = require('../models/user');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/* Sign in using Email and Password */
passport.use('local-login', new LocalStrategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true // allows us to pass back the entire request to the callback
}, function(req, email, password, done) { // callback with email and password from our form

  // find a user whose email is the same as the forms email
  // we are checking to see if the user trying to login already exists
  User.findOne({ email:  email }, function(err, user) {
    // if there are any errors, return the error before anything else
    if (err)
    return done(err);

    // if no user is found, return the message
    if (!user)
    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

    // if the user is found but the password is wrong
    if (!user.comparePassword(password))
    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

    // all is well, return successful user
    return done(null, user);
  });

}));

/*passport.use(new GoogleStrategy ({
  clientID: '83965076315-697avjv7fmjlh0m51sjp95o3jprcs7qu.apps.googleusercontent.com',
  clientSecret: '0L1W4H1OHUAYjE9mfWhgf_jZ',
  callbackURL: 'http://localhost:3000/auth/google/callback',
}, function(accessToken, refreshToken, profile, next) {
  User.findOne({ googleId: profile.id}, function(err, user) {
    if(user) {
      return next(err,user);
    } else {
      var newUser = new User();
      newUser.email = profile.emails[0].value;
      newUser.googleId = profile.id;
      newUser.name = profile.displayName;
      newUser.photo = profile._json.image.url;
      newUser.save(function(err) {
        if(err) throw err;
        next(err, newUser);
      });
    }
  });
}));*/


exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login');
}
