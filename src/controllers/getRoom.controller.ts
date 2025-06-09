import { Request, Response } from 'express';
import prisma from '@/lib/db';

export const getRoomById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const roomId = Number(req.params.id);
    if (isNaN(roomId)) {
      res.json({ isNAN: true });
      return;
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        users: true,
        votes: { include: { cards: true } },
      },
    });

    if (!room) {
      res.json({ roomNotFound: true });
      return;
    }

    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
