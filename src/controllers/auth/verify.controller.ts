import prisma from '@/lib/db';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY!;
const authTokenName = process.env.AUTH_TOKEN_NAME!;
const maxAgeAuthToken = 3 * 24 * 60 * 60;

export const verifyCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code, token } = req.body;

    if (!token || !code) {
      res.json({ message: 'aucun token fourni' });
      return;
    }

    const decoded: any = jwt.verify(token, secretKey);

    const expectedCode = decoded.infos?.code;
    const userId = decoded.infos?.id;

    if (expectedCode && code === expectedCode) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.json({ userNotFound: true });
        return;
      }
      const payload = {
        id: user.id,
        authToken: true,
      };

      const authToken = jwt.sign({ infos: payload }, secretKey, {
        expiresIn: maxAgeAuthToken,
      });

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: maxAgeAuthToken * 1000,
      };

      res.cookie(authTokenName, authToken, cookieOptions);
      res.status(200).json({ codeValid: true });
    } else {
      res.json({ codeValid: false });
    }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.json({ expired: true });
    } else {
      res.status(500).json({ error });
    }
  }
};
