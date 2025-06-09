import { Request, Response } from 'express';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY as string;
const tokenName = process.env.AUTH_TOKEN_NAME as string;

export const room = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name }: { name: string } = req.body;
    const token = req.cookies?.[tokenName];
    if (!name) {
      res.json({ error: 'Le nom est requis' });
      return;
    }
    if (!token) {
      res.json({ error: 'Non authentifié' });
      return;
    }
    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };
    const userId = Number(decoded.infos.id);
    if (!userId) {
      res.json({ error: 'Token invalide' });
      return;
    }

    const existingRoom = await prisma.room.findUnique({
      where: {
        name_userId: {
          name,
          userId,
        },
      },
    });
    if (existingRoom) {
      res.json({ roomAlreadyExist: true });
      return;
    }

    const newRoom = await prisma.room.create({
      data: { name, userId },
    });

    const userRoom = await prisma.userRoom.create({
      data: {
        userId,
        roomId: newRoom.id,
      },
    });

    const createdUserRoom = await prisma.userRoom.findUnique({
      where: { id: userRoom.id },
      include: {
        room: {
          include: {
            users: true,
            votes: { include: { cards: true } },
          },
        },
        user: true,
      },
    });

    res.json({ userRoom: createdUserRoom });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la room' });
  }
};
