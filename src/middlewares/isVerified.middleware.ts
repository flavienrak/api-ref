import { Request, Response, NextFunction } from 'express';
import prisma from '@/lib/db';

export async function isVerified(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const email = req.body.email;
  if (!email) {
    res.status(400).json({ error: 'Email requis' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isVerified) {
    res.status(403).json({ error: 'Utilisateur non vérifié' });
    return;
  }
  next();
}
