import prisma from '@/lib/db';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET_KEY as string;
const tokenName = process.env.AUTH_TOKEN_NAME as string;

export const checkConnectionStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log('tokenName:', tokenName);
    const token = req.cookies?.[tokenName];
    console.log('token:', token);

    if (!token) {
      res.json({ noToken: true });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: Number(decoded.infos.id) },
      });
    } catch (error) {
      res.status(500).json({ error });
      return;
    }

    if (!user) {
      res.clearCookie(tokenName, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      res.json({ userNotFound: true });
      return;
    }
    res.json({ id: user.id });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.json({ expired: true });
    } else {
      res.status(500).json(error);
    }
  }
};
