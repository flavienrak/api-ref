// routes/user.routes.ts
import { getUserWithRooms } from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();
router.get('/rooms', getUserWithRooms);
export default router;
