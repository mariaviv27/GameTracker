const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 🔑 GitHub puede NO devolver email
        let email = null;

        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        }

        // Fallback si no hay email
        if (!email) {
          email = `${profile.username}@github.local`;
        }

        let user = await User.findOne({
          $or: [
            { githubId: profile.id },
            { email }
          ]
        });

        if (!user) {
          user = await User.create({
            username: profile.username,
            email,
            githubId: profile.id,
            password: "github_oauth"
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
