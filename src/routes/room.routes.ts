import { Router } from 'express';
import {
  chooseCard,
  createVote,
  deleteRoom,
  editVote,
  getRoomById,
  getUserRoom,
  getVotesByRoom,
  room,
} from '@/controllers/room.controller';

const router = Router();

//room
router.post('/', room);
router.get('/', getUserRoom);
router.get('/:id', getRoomById);
router.delete('/:id', deleteRoom);

//vote
router.post('/:id', createVote);
router.get('/:id/vote/:voteId', getVotesByRoom);
router.put('/:voteId', editVote);

//Card
router.post('/:voteId/card', chooseCard);
export default router;
