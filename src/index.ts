import express, { Request, Response } from 'express';
import path from 'path';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

import { app, logger, server } from '@/socket';
import { isAuthenticated } from '@/middlewares/auth.middleware';

import accessRoutes from '@/routes/access.routes';
import { isVerified } from './middlewares/isVerified.middleware';
import roomRoutes from './routes/room.routes';
import authRoutes from './routes/auth.routes';
import googleRoutes from './routes/google.routes';
import { google } from 'googleapis';

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
app.use('/api/', googleRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/room', roomRoutes);

const port = process.env.BACKEND_PORT;
if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App runing at: ${port}`));
}
