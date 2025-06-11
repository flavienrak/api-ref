import prisma from '@/lib/db';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET_KEY as string;

export const verifyToken = (req: Request, res: Response): void => {
  try {
    const { token } = req.params;

    if (!token) {
      res.json({ message: 'Aucun token fourni' });
      return;
    }

    jwt.verify(token, secretKey);

    res.status(200).json({ decoded: true });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.json({ expired: true });
    } else {
      res.status(500).json(error);
    }
  }
};

export const Oauth = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token;

    if (!token) {
      res.json({ noToken: true });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secretKey) as {
        infos: { email: string; name: string; profile: string };
      };
    } catch (error) {
      res.json({ tokenInvalid: true });
      return;
    }

    const email = decoded.infos.email;

    if (!email) {
      res.json({ emailNotFound: true });
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
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
