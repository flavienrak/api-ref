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
router.get('/:id', getRoomById);
router.delete('/:id', deleteRoom);

router.post('/:id', createVote);
router.get('/:id/vote', getVotesByRoom);

export default router;
