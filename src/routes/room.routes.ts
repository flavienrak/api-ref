import { Router } from 'express';
import {
  createVote,
  deleteRoom,
  getUserRoom,
  getVotesByRoom,
  room,
} from '@/controllers/room.controller';

const router = Router();

//room
router.post('/', room);
router.get('/user', getUserRoom);
router.delete('/:id', deleteRoom);

//vote
router.post('/:id', createVote);
router.get('/:id/vote', getVotesByRoom);

export default router;
