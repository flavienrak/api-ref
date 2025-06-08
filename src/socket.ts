import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import winston from 'winston';
import compression from 'compression';
import { Server, Socket } from 'socket.io';
import prisma from '@/lib/db';

dotenv.config();
const app = express();

app.use(
  cors({
    // origin: ["http://localhost:5173"],
    origin: (origin, callback) => {
      if (origin) {
        callback(null, origin);
      } else {
        callback(null, '*');
      }
    },
    credentials: true,
    preflightContinue: false,
    allowedHeaders: ['sessionId', 'Content-Type'],
    exposedHeaders: ['sessionId'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface CardChoicePayload {
  roomCode: string;
  userId: string;
  cards: number[];
}

interface RevealPayload {
  roomCode: string;
  userId: string;
}

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Nouvelle connexion socket :', socket.id);

    // Quand un user rejoint un room
    socket.on('join-room', ({ roomCode }) => {
      socket.join(roomCode);
      console.log(` ${socket.id} a rejoint la room ${roomCode}`);
    });

    // Quand un user choisit ses cartes
    // socket.on('choose-cards', async (payload: CardChoicePayload) => {
    //   const { roomCode, userId, cards } = payload;

    //   try {
    //     const room = await prisma.room.findUnique({
    //       where: { code: roomCode },
    //       include: { users: true },
    //     });
    //     if (!room) return;

    //     //
    //     await prisma.userCard.createMany({
    //       data: cards.map((cardId) => ({
    //         userId: Number(userId),
    //         cardId: cardId,
    //         roomId: room.id,
    //       })),
    //       skipDuplicates: true,
    //     });

    //     io.to(roomCode).emit('cards-updated', { userId, cards });
    //   } catch (err) {
    //     console.error(' Erreur lors du choix de carte :', err);
    //   }
    // });

    // socket.on('reveal-cards', async (payload: RevealPayload) => {
    //   const { roomCode, userId } = payload;

    //   try {
    //     const room = await prisma.room.findUnique({
    //       where: { code: roomCode },
    //     });

    //     if (!room || room.createdBy !== Number(userId)) {
    //       socket.emit('reveal-error', { error: 'Accès refusé' });
    //       return;
    //     }

    //     const userCards = await prisma.userCard.findMany({
    //       where: { room: { code: roomCode } },
    //       include: {
    //         card: true,
    //         user: { select: { id: true, name: true, email: true } },
    //       },
    //     });

    //     // Révéler à tout le monde
    //     io.to(roomCode).emit('cards-revealed', {
    //       cards: userCards.map((uc: any) => ({
    //         number: uc.card.value,
    //         user: uc.user,
    //       })),
    //     });
    //   } catch (err) {
    //     console.error(' Erreur lors de la révélation :', err);
    //   }
    // });

    socket.on('disconnect', () => {
      console.log(' Déconnexion socket :', socket.id);
    });
  });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

export { app, logger, io, server };
