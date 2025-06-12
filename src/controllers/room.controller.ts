import { Request, Response } from 'express';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';
import { getUserWithRooms } from '@/controllers/user.controller';
import { allUsers, io } from '@/socket';

const secretKey = process.env.JWT_SECRET_KEY as string;
const tokenName = process.env.AUTH_TOKEN_NAME as string;

export const createRoom = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profile: true,
          },
        },
      },
    });

    const user = allUsers.get(userId.toString());
    if (user && user.socket) {
      user.socket.join(`room-${newRoom.id}`);
    }

    res.json({ userRoom: createdUserRoom });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la room' });
  }
};

export const getUserRooms = async (
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
            name: true,
          },
        },
        room: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: true,
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
    const token = req.cookies?.[tokenName];

    if (!token) {
      res.json({ NotAuthentificate: true });
      return;
    }
    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };
    const userId = Number(decoded.infos.id);
    if (!userId) {
      res.json({ invalidToken: true });
      return;
    }
    if (isNaN(Number(id))) {
      res.json({ invalidId: true });
      return;
    }

    const existRoom = await prisma.room.findUnique({
      where: { id: Number(id) },
    });

    if (!existRoom) {
      res.json({ roomNotFound: true });
      return;
    }

    const userRoom = await prisma.userRoom.findUnique({
      where: {
        roomId_userId: {
          roomId: existRoom.id,
          userId: userId,
        },
      },
    });

    if (!userRoom) {
      await prisma.userRoom.create({
        data: {
          userId,
          roomId: Number(id),
        },
      });
    }

    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profile: true,
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
                profile: true,
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
    io.to(`room-${room.id}`).emit('joinRoom', { room });
    res.status(200).json({ room });
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

    io.to(`room-${room.id}`).emit('deleteRoom', { room });

    res.json({ room });
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
    const createdVote = await prisma.vote.findUnique({
      where: { id: vote.id },
      include: {
        cards: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    io.to(`room-${vote.roomId}`).emit('createVote', { vote: createdVote });

    res.json({ vote: createdVote });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du vote' });
  }
};

export const getVoteById = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[tokenName];
    if (!token) {
      res.status(401).json({ NoAuthentificate: true });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };
    const currentUserId = Number(decoded.infos.id);

    const { id, voteId } = req.params;
    if (!id || isNaN(Number(id)) || !voteId || isNaN(Number(voteId))) {
      res.json({ invalidId: true });
      return;
    }

    const vote = await prisma.vote.findUnique({
      where: {
        id: Number(voteId),
        roomId: Number(id),
      },
      include: {
        room: {
          select: {
            userId: true,
          },
        },
        cards: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!vote) {
      res.status(404).json({ voteNotFound: true });
      return;
    }

    if (vote.room.userId !== currentUserId) {
      res.json({ unAuthorized: true });
      return;
    }

    res.json({ vote });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
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

    io.to(`room-${vote.roomId}`).emit('updateVote', { vote: updatedVote });

    res.json({ vote: updatedVote });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la modification du vote' });
  }
};

export const deleteVote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { voteId } = req.params;

    if (isNaN(Number(voteId))) {
      res.json({ invalidId: true });
      return;
    }

    const vote = await prisma.vote.findUnique({
      where: { id: Number(voteId) },
    });

    if (!vote) {
      res.json({ voteNotFound: true });
      return;
    }

    await prisma.vote.delete({
      where: { id: Number(voteId) },
    });

    io.to(`room-${vote.roomId}`).emit('deleteVote', { vote });

    res.status(200).json({ vote });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const chooseCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.cookies?.[tokenName];
    if (!token) {
      res.json({ NoAuthentificate: true });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };
    const userId = Number(decoded.infos.id);

    const { id, voteId } = req.params;
    const { value }: { value: number | string } = req.body;

    if (!voteId || isNaN(Number(voteId)) || !value) {
      res.json({ invalidVoteId: true });
      return;
    }

    const vote = await prisma.vote.findUnique({
      where: { id: Number(voteId) },
    });

    if (!vote) {
      res.json({ votNotFound: true });
      return;
    }

    if (vote.status === 'show') {
      res.json({ alreadyShow: true });
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

    let card;

    if (existingCard) {
      card = await prisma.card.update({
        where: { id: existingCard.id },
        data: { value: value.toString() },
      });
    } else {
      card = await prisma.card.create({
        data: {
          value: value.toString(),
          userId,
          voteId: Number(voteId),
        },
      });
    }

    const cardWithoutValue: {
      id: number;
      voteId: number;
      value?: string;
      userId: number;
      createdAt: Date;
      updatedAt: Date;
    } = { ...card };
    delete cardWithoutValue.value;

    io.to(`room-${vote.roomId}`).emit('chooseCard', {
      card: cardWithoutValue,
    });

    res.json({ card });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du choix de la carte' });
  }
};

export const showCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, voteId } = req.params;

    if (!voteId || isNaN(Number(voteId))) {
      res.json({ voteIdInvalid: true });
      return;
    }

    const vote = await prisma.vote.findUnique({
      where: { id: Number(voteId) },
      include: {
        cards: true,
        room: {
          include: {
            userRooms: true,
          },
        },
      },
    });

    if (!vote) {
      res.json({ voteNotFound: true });
      return;
    }

    const totalUsers = vote.room.userRooms.length;
    const totalCards = vote.cards.length;

    if (totalCards < totalUsers) {
      res.json({ unAuthorized: true });
      return;
    }

    const updatedVote = await prisma.vote.update({
      where: { id: vote.id },
      data: { status: 'show' },
    });

    io.to(`room-${vote.roomId}`).emit('showCards', { vote: updatedVote });

    res.status(200).json({ vote: updatedVote });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du choix de la carte' });
  }
};
