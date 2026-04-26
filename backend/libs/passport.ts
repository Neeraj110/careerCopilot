import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { prisma } from "./prisma.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "placeholder";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "placeholder";
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "placeholder";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "placeholder";

const CALLBACK_BASE = process.env.API_URL || "http://localhost:5000";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${CALLBACK_BASE}/api/auth/callback/google`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email found from Google"));

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || "Google User",
              googleId: profile.id,
            },
          });
        } else if (!user.googleId) {
          // Link account
          user = await prisma.user.update({
            where: { email },
            data: { googleId: profile.id },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${CALLBACK_BASE}/api/auth/callback/github`,
      scope: ["user:email"],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value || profile.username + "@github.local";
        
        let user = await prisma.user.findFirst({ where: { OR: [{ email }, { githubId: profile.id }] } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username || "GitHub User",
              githubId: profile.id,
            },
          });
        } else if (!user.githubId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { githubId: profile.id },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
