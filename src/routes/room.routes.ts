import { Router } from 'express';
import {
  chooseCard,
  createVote,
  deleteRoom,
  editVote,
  getRoomById,
  getUserRooms,
  getVoteById,
  createRoom,
  deleteVote,
  showCards,
} from '@/controllers/room.controller';

const router = Router();

//room
router.post('/', createRoom);
router.get('/', getUserRooms);
router.get('/:id', getRoomById);
router.delete('/:id', deleteRoom);

//vote
router.post('/:id', createVote);
router.get('/:id/vote/:voteId', getVoteById);
router.put('/:voteId', editVote);
router.delete('/:id/vote/:voteId', deleteVote);

//Card
router.post('/:id/vote/:voteId/card', chooseCard);
router.get('/:id/vote/:voteId/show', showCards);
export default router;
