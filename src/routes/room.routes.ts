import { Router } from 'express';
import {
  createVote,
  deleteRoom,
  getRoomById,
  getVotesByRoom,
  room,
} from '@/controllers/room.controller';

const router = Router();

router.post('/', room);
router.post('/:roomId', createVote);
router.get('/:id', getRoomById);
router.get('/votes/:roomId', getVotesByRoom);
router.delete('/:id', deleteRoom);

export default router;
