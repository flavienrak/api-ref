import { Router } from 'express';
import { getRoomById, room } from '@/controllers/room.controller';

const router = Router();

router.post('/', room);
router.get('/:id', getRoomById);

export default router;
