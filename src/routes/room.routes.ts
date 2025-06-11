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
  joinRoom,
  deleteVote,
} from '@/controllers/room.controller';

const router = Router();

//room
router.post('/', createRoom);
router.post('/:id/join', joinRoom);
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
export default router;
