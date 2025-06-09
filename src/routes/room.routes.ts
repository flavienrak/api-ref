import { Router } from 'express';
import {
  chooseCard,
  createVote,
  deleteRoom,
  editVote,
  getRoomById,
  getUserRooms,
  getVotesById,
  createRoom,
} from '@/controllers/room.controller';

const router = Router();

//room
router.post('/', createRoom);
router.get('/', getUserRooms);
router.get('/:id', getRoomById);
router.delete('/:id', deleteRoom);

//vote
router.post('/:id', createVote);
router.get('/:id/vote/:voteId', getVotesById);
router.put('/:voteId', editVote);

//Card
router.post('/:voteId/card', chooseCard);
export default router;
