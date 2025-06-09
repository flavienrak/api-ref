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

export const google = (req: Request, res: Response) => {
  console.log('Google OAuth: redirecting to Google login');
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  console.log('Generated Google Auth URL:', url);
  res.redirect(url);
};

export const callback = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  console.log('Google OAuth callback called. Code:', code);

  if (!code) {
    console.log('No authorization code provided');
    res.json({ error: 'Authorization code not provided.' });
    return;
  }

  try {
    const { tokens } = await client.getToken(code);
    console.log('Tokens received from Google:', tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log('ID Token verified');

    const payload = ticket.getPayload();
    console.log('Payload from Google:', payload);

    if (!payload || !payload.email) {
      console.log('Invalid token payload');
      res.json({ error: 'Invalid token payload' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    console.log('User found in DB:', user);

    if (!user) {
      console.log('User not found, creating new user');
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || '',
          password: 'password',
          isVerified: false,
        },
      });
      console.log('New user created:', user);
    }

    const token = jwt.sign(
      { infos: { id: user.id, email: user.email } },
      secretKey,
      { expiresIn: '7d' },
    );
    console.log('JWT generated:', token);

    res.cookie(tokenName, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log('Cookie set, redirecting to /');

    res.redirect('/');
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
};
