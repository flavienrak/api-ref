import express, { Request, Response } from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();

import '@/controllers/auth/passport.controller';

import { app, logger, server } from '@/socket';

import authRoutes from './routes/auth.routes';
import mailRoutes from './routes/mail/mail.routes';
import userRoutes from './routes/user.routes';
import roomRoutes from './routes/room.routes';
import tokenRoutes from './routes/token.routes';
import passportRoutes from './routes/passport.routes';

app.use(passport.initialize());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (_req: Request, res: Response) => {
  res.send('Backend running successfully!');
});

app.use('/api/google', passportRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/user', userRoutes);
app.use('/api/room', roomRoutes);

const port = process.env.BACKEND_PORT;
if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App running at: ${port}`));
}
