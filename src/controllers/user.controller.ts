import { Request, Response } from 'express';
import prisma from '@/lib/db';

export const getUserWithRooms = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID utilisateur invalide' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rooms: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    const rooms = user.rooms.map((roomUser) => roomUser.room);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      rooms,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
