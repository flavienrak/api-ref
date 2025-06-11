import prisma from '@/lib/db';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY as string;

export const verifyGoogleAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.body.token;

    if (!token) {
      res.json({ error: 'token manquant' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secretKey) as { infos: { email: string } };
    } catch (error) {
      res.json({ error: 'token pas valide' });
      return;
    }

    const email = decoded.infos.email;

    if (!email) {
      res.json({ error: 'email manquant dans le token' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.json({ userNotFound: true });
      return;
    }

    res.json({ id: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
