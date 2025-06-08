import { getUserWithRooms } from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();
router.get('/', getUserWithRooms);
export default router;
