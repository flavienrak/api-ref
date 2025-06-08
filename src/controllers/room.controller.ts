import { Request, Response } from 'express';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Création d'une room (réservé à ceux qui ont validé leur code)
export async function createRoom(req: Request, res: Response) {
  const body: { email: string } = req.body;

  // if (!body.email) {
  //   res.status(400).json({ error: 'Email requis' });
  //   return;
  // }

  try {
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }

    // Crée une room avec code unique et référence le créateur
    const room = await prisma.room.create({
      data: {
        code: uuidv4(),
        createdBy: user.id,
        users: {
          create: [
            {
              user: { connect: { id: user.id } },
              role: 'admin',
            },
          ],
        },
      },
      include: { users: { include: { user: true } } },
    });

    res.status(201).json({ room });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur création room' });
    return;
  }
}

// Rejoindre une room
export async function joinRoom(req: Request, res: Response) {
  const body: { roomCode: string; name: string; email: string } = req.body;
  // if (!body.roomCode || !body.email || !body.name) {
  //   res.status(400).json({ error: 'Champs requis' });
  //   return;
  // }

  try {
    let user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email: body.email, name: body.name },
      });
    }

    const room = await prisma.room.findUnique({
      where: { code: body.roomCode },
    });
    if (!room) {
      res.status(404).json({ error: 'Room introuvable' });
      return;
    }

    await prisma.roomUser.create({
      data: {
        roomId: room.id,
        userId: user.id,
        role: 'user',
      },
    });

    res.json({ message: 'Rejoint avec succès', room });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur rejoindre room' });
    return;
  }
}
