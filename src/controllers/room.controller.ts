import { Request, Response } from 'express';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';
import { getUserWithRooms } from '@/controllers/user.controller';

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
            userRooms: true,
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

export const getUserRoom = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.cookies?.[tokenName];

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

    const userRooms = await prisma.userRoom.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        room: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
            votes: { include: { cards: true } },
            userRooms: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userRooms) {
      res.json({ userRoomNotFound: true });
      return;
    }

    res.json({ userRooms });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getRoomById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      res.json({ invalidId: true });
      return;
    }

    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        votes: { include: { cards: true } },
        userRooms: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
    if (!room) {
      res.json({ roomNotFound: true });
      return;
    }

    res.json({ room });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const deleteRoom = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const token = req.cookies?.[tokenName];

    if (!token) {
      res.json({ error: 'Non authentifié' });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };
    const userId = Number(decoded.infos.id);

    if (isNaN(Number(id))) {
      res.json({ invalidId: true });
      return;
    }

    const room = await prisma.room.findUnique({ where: { id: Number(id) } });

    if (!room) {
      res.json({ roomNotFound: true });
      return;
    }

    if (room.userId !== userId) {
      res.json({ notAuthorized: true });
      return;
    }

    await prisma.room.delete({ where: { id: room.id } });

    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la room' });
  }
};

export const createVote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content, min, max, mid } = req.body;
    const { id } = req.params;
    const token = req.cookies?.[tokenName];

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

    if (!content || !id) {
      res.json({ error: 'Champs requis manquants' });
      return;
    }

    const vote = await prisma.vote.create({
      data: {
        content,
        min: min ?? 1,
        max: max ?? 5,
        mid: mid ?? 1,
        roomId: Number(id),
      },
    });

    res.json({ vote });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du vote' });
  }
};

export const getVotesByRoom = async (req: Request, res: Response) => {
  try {
    const { id, voteId } = req.params;
    if (!id || isNaN(Number(id))) {
      res.json({ invalidRoomId: true });
      return;
    }

    const vote = await prisma.vote.findUnique({
      where: { id: Number(voteId), roomId: Number(id) },
      include: {
        cards: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    res.json({ vote });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const editVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { voteId } = req.params;
    const { content, min, max, mid } = req.body;

    if (!voteId || isNaN(Number(voteId))) {
      res.json({ invalidVoteId: true });
      return;
    }

    const vote = await prisma.vote.findUnique({
      where: { id: Number(voteId) },
    });
    if (!vote) {
      res.json({ voteNotFound: true });
      return;
    }
    const updatedVote = await prisma.vote.update({
      where: { id: Number(voteId) },
      data: {
        content,
        min,
        max,
        mid,
      },
    });

    res.json({ vote: updatedVote });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la modification du vote' });
  }
};

export const chooseCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.cookies?.[tokenName];
    if (!token) {
      res.json({ error: 'Non authentifié' });
      return;
    }
    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };
    const userId = Number(decoded.infos.id);

    const { voteId } = req.params;
    const { value } = req.body;

    if (!voteId || isNaN(Number(voteId)) || !value) {
      res.json({ error: 'Paramètres manquants' });
      return;
    }

    const existingCard = await prisma.card.findUnique({
      where: {
        userId_voteId: {
          userId,
          voteId: Number(voteId),
        },
      },
    });

    if (existingCard) {
      res.json({ alreadyChoosed: true });
      return;
    }

    const card = await prisma.card.create({
      data: {
        value,
        userId,
        voteId: Number(voteId),
      },
    });

    res.json({ card });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du choix de la carte' });
  }
};
