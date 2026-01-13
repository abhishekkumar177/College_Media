const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Serialize user (not actually used since we use stateless JWT, but passport might guard check)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists by googleId
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if user exists by email
                if (profile.emails && profile.emails.length > 0) {
                    const email = profile.emails[0].value;
                    user = await User.findOne({ email });

                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id;
                        if (user.authProvider === 'local') {
                            // Keep local but allow google login (hybrid) or switch? 
                            // Better to keep as is, just add googleId
                        }
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user
                const newUser = new User({
                    username: `user_${profile.id.substring(0, 8)}`, // generic username
                    email: profile.emails[0].value,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    googleId: profile.id,
                    authProvider: 'google',
                    profilePicture: profile.photos ? profile.photos[0].value : '',
                    role: 'student' // Default role
                });

                // Handle username collision logic if needed (simple retry or random suffix)
                // For now, assume generic username with ID part is unique enough or handle error elsewhere

                await newUser.save();
                done(null, newUser);
            } catch (err) {
                logger.error('Google OAuth Error:', err);
                done(err, null);
            }
        }));
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback",
        scope: ['user:email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });

                if (user) {
                    return done(null, user);
                }

                let email = null;
                if (profile.emails && profile.emails.length > 0) {
                    email = profile.emails[0].value;
                }

                // If no public email, might need to fetch it separately or handle sans email (User model requires email)
                if (!email) {
                    logger.warn('GitHub OAuth: No public email found for user', profile.username);
                    // Fallback or error? User model requires email.
                    // GitHub strategy often requires extra call for private emails if scope is set but email is null in profile
                    return done(new Error('No email found in GitHub profile'), null);
                }

                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    existingUser.githubId = profile.id;
                    await existingUser.save();
                    return done(null, existingUser);
                }

                const newUser = new User({
                    username: profile.username || `github_${profile.id}`,
                    email: email,
                    firstName: profile.displayName ? profile.displayName.split(' ')[0] : profile.username,
                    lastName: profile.displayName ? profile.displayName.split(' ').slice(1).join(' ') : '',
                    githubId: profile.id,
                    authProvider: 'github',
                    profilePicture: profile.photos ? profile.photos[0].value : '',
                    role: 'student'
                });

                await newUser.save();
                done(null, newUser);
            } catch (err) {
                logger.error('GitHub OAuth Error:', err);
                done(err, null);
            }
        }));
}

module.exports = passport;
