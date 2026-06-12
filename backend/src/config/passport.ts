import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../infrastructure/prisma";

// The passport configuration will happen inside an init function
export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists in our db with the given google ID
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email found from Google"));

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
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
          done(error as Error);
        }
      },
    ),
  );
};
