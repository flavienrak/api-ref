import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY as string;
const tokenName = process.env.AUTH_TOKEN_NAME as string;

export const checkConnectionStatus = (req: Request, res: Response): void => {
  try {
    const token = req.cookies?.[tokenName];

    if (!token) {
      res.json({ noToken: true });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };

    if (!decoded.infos.id) {
      res.clearCookie(tokenName, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      res.json({ userNotFound: true });
      return;
    }
    res.json({ id: decoded.infos.id });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.json({ expired: true });
    } else {
      res.status(500).json(error);
    }
  }
};
