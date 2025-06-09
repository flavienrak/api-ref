import express, { Request, Response } from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

import { app, logger, server } from '@/socket';

import authRoutes from './routes/auth.routes';
import googleRoutes from './routes/google.routes';
import mailRoutes from './routes/mail/mail.routes';
import userRoutes from './routes/user.routes';
import roomRoutes from './routes/room.routes';

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  }),
);

app.get('/', (req: Request, res: Response) => {
  res.send('Backend running successfully!');
});
app.use('/api/auth', authRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/user', userRoutes);
app.use('/api/room', roomRoutes);

const port = process.env.BACKEND_PORT;
if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App runing at: ${port}`));
}
