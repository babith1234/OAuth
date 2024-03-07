const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
require("dotenv").config();
const User = require("./models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        console.log("Details saved");
        return done(null, user);
      } else {
        user = new User({
          googleId: profile.id,
          name: profile.displayName || "Default Name",
          email: profile.emails[0].value || "Default Email",
        });
        console.log("Details saved");
        await user.save();
        return done(null, user);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(user.id);
  done(null, user.id); // Storing user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      // If user is not found, return an error
      return done(new Error("User not found"), null);
    }
    // User found, attach user object to req.user
    done(null, user);
  } catch (error) {
    // Handle any other errors
    done(error, null);
  }
});

module.exports = passport;
