import { createVote } from '@/controllers/vote.controller';
import { Router } from 'express';

const router = Router();
router.post('/:roomId', createVote);
export default router;
