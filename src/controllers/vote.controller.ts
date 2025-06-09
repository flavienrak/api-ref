import { Request, Response } from 'express';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY as string;
const tokenName = process.env.AUTH_TOKEN_NAME as string;

export const createVote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content, min, max, mid } = req.body;
    const { roomId } = req.params;
    const token = req.cookies?.[tokenName];

    if (!token) {
      res.json({ error: 'Non authentifié' });
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { infos: { id: string } };
    const userId = Number(decoded.infos.id);

    if (!content || !roomId) {
      res.json({ error: 'Champs requis manquants' });
      return;
    }

    const vote = await prisma.vote.create({
      data: {
        content,
        min: min ?? 1,
        max: max ?? 5,
        mid: mid ?? 1,
        roomId: Number(roomId),
      },
    });

    res.json({ vote });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du vote' });
  }
};
