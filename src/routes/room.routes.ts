import { Router } from 'express';
import { deleteRoom, getRoomById, room } from '@/controllers/room.controller';

const router = Router();

router.post('/', room);
router.get('/:id', getRoomById);
router.delete('/:id', deleteRoom);

export default router;
