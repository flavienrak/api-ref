import express, { Request, Response } from 'express';
import path from 'path';

import { app, logger, server } from '@/socket';
import { isAuthenticated } from '@/middlewares/auth.middleware';

import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req: Request, res: Response) => {
  res.send('Backend running successfully!');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', isAuthenticated, userRoutes);

const port = process.env.BACKEND_PORT;
if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App runing at: ${port}`));
}
