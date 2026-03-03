const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const prisma = require('../lib/prisma');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const displayName = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value || null;

        // Check if user already exists by googleId
        let user = await prisma.user.findUnique({ where: { googleId } });

        if (user) {
          return done(null, user);
        }

        // Check if user exists by email (link accounts)
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Link Google account to existing email user
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId, avatarUrl: avatarUrl || user.avatarUrl },
          });
          return done(null, user);
        }

        // Create new user
        user = await prisma.user.create({
          data: { email, googleId, displayName, avatarUrl },
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
