import { Request, Response } from 'express';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY as string;
const tokenName = process.env.AUTH_TOKEN_NAME as string;

export const getUserWithRooms = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[tokenName];
    if (!token) {
      res.json({ notAuthentificate: true });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { infos?: { id?: number } };
    const userId = decoded.infos?.id;

    if (!userId) {
      res.json({ invalidToken: true });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRooms: {
          include: {
            room: {
              include: {
                users: true,
                votes: { include: { cards: true } },
              },
            },
            user: true,
          },
        },
      },
    });

    if (!user) {
      res.json({ userNotFound: true });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error });
  }
};
