import { Router, Request, Response } from 'express';
import passport from 'passport';
import { maxAgeAuthToken } from '@/utils/constants';

const tokenName = process.env.AUTH_TOKEN_NAME as string;
const frontendUri = process.env.FRONTEND_URI as string;

const router = Router();

router.get(
  '/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'consent',
  }),
);

router.get(
  '/callback',
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    const userData = req.user as any;
    const { token } = userData;

    res.cookie(tokenName, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: maxAgeAuthToken,
    });

    res.redirect(`${frontendUri}/room`);
  },
);

export default router;
