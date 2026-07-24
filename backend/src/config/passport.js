const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const ClientProfile = require('../models/ClientProfile');

// Fallback string prevents passport-google-oauth20 from throwing at boot
// when Google credentials haven't been configured yet. Google login simply
// won't work until real values are set in backend/.env.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'not-configured',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Existing local account signing in with Google for the first time
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true;
            if (!user.avatar?.url) {
              user.avatar = { url: profile.photos?.[0]?.value || '', publicId: '' };
            }
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              authProvider: 'google',
              isEmailVerified: true,
              avatar: { url: profile.photos?.[0]?.value || '', publicId: '' },
              role: 'client',
            });
            await ClientProfile.create({ user: user._id });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
