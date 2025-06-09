import { Router } from 'express';
import { room } from '@/controllers/room.controller';
import { getRoomById } from '@/controllers/getRoom.controller';

const router = Router();

router.post('/', room);
router.get('/:id', getRoomById);

export default router;
