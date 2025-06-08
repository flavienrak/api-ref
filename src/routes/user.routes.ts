// routes/user.routes.ts
import { getUserWithRooms } from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();
router.get('/:id/rooms', getUserWithRooms);
export default router;
