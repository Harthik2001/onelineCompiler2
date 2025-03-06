
// server/config/passport.js
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_BASE_URL,                               ///changed
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('GoogleStrategy: accessToken:', accessToken);
      console.log('GoogleStrategy: refreshToken:', refreshToken);
      console.log('GoogleStrategy: profile:', profile);

      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            googleId: profile.id,
            fullname: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        console.error('GoogleStrategy: Error:', error);
        return done(error, false);
      }
    }
  )
);
// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user); // or done(null, user.id) if you are using database id
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user); // or find user from database by id
});
module.exports = passport;