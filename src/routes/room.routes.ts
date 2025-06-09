import { Router } from 'express';
import { room } from '@/controllers/room.controller';

const router = Router();

router.post('/', room);

export default router;
