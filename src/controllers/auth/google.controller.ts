import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';

dotenv.config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const secretKey = process.env.JWT_SECRET_KEY as string;
const tokenName = process.env.AUTH_TOKEN_NAME as string;
const frontendUri = process.env.FRONTEND_URI as string;

export const google = (req: Request, res: Response): void => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  res.redirect(url);
};

export const callback = async (req: Request, res: Response): Promise<void> => {
  console.log('callback');
  const code = req.query.code as string;

  if (!code) {
    res.json({ error: 'Authorization code not provided.' });
    return;
  }
  console.log('code:', code);

  try {
    const { tokens } = await client.getToken({
      code,
    });
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      res.json({ error: 'Invalid token payload' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      const token = jwt.sign(
        {
          infos: {
            email: payload.email,
            name: payload.name,
            profile: payload.picture,
          },
        },
        secretKey,
        { expiresIn: '7d' },
      );
      res.json({
        userNotFound: true,
        name: payload.name,
        email: payload.email,
        profile: payload.picture,
      });

      const redirectUrl = `${frontendUri}/auth/${token}`;
      return res.redirect(redirectUrl);
    }

    const token = jwt.sign(
      { infos: { id: user.id, email: user.email } },
      secretKey,
      { expiresIn: '7d' },
    );

    res.cookie(tokenName, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${frontendUri}/room`);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
};
