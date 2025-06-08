import { Router } from 'express';
import { createRoom, joinRoom } from '@/controllers/room.controller';
import { isVerified } from '@/middlewares/isVerified.middleware';
import {
  createRoomValidation,
  joinRoomValidation,
} from '@/validations/room.validation';

const router = Router();

router.post('/create', createRoomValidation, isVerified, createRoom);
router.post('/join', joinRoomValidation, joinRoom);

export default router;
