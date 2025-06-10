import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY as string;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_REDIRECT_URI as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        if (!email) {
          return done(
            new Error('Aucune adresse email trouvée dans le profil Google'),
            false,
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          const token = jwt.sign(
            {
              infos: {
                email,
                name,
                profile: picture,
              },
            },
            secretKey,
            { expiresIn: '7d' },
          );
          return done(null, { profile, token });
        }

        const userPayload = { id: user.id, email: user.email };
        const token = jwt.sign({ infos: userPayload }, secretKey, {
          expiresIn: '7d',
        });

        return done(null, { profile, token });
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.email);
});
passport.deserializeUser((user: any, done) => {
  done(null, user);
});
