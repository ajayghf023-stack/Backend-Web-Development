
'use strict';
// auth/passport.js — Google OAuth strategy

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    // Extract Google profile information
    const googleId = profile.id;
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const emailVerified = profile._json.email_verified;

    // Scenario 1: Returning OAuth user
    const existingGoogleUser = users.find(
      (user) => user.googleId === googleId
    );

    if (existingGoogleUser) {
      return done(null, existingGoogleUser);
    }

    // Scenario 2: Existing local account
    const existingLocalUser = users.find(
      (user) => user.email === email
    );

    if (existingLocalUser) {
      if (emailVerified) {
        existingLocalUser.googleId = googleId;
        return done(null, existingLocalUser);
      }

      return done(null, false);
    }

    // Scenario 3: Brand-new user
    const newUser = {
      id: nextId(),
      googleId: googleId,
      email: email,
      name: name,
      role: 'member',
    };

    users.push(newUser);

    return done(null, newUser);

  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/auth/google/callback',
    },
    verifyCallback,
  ),
);

// Export for testing
module.exports = { passport, verifyCallback };
