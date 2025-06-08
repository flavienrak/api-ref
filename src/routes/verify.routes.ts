import { Router } from 'express';
import { verifyCode } from '@/controllers/auth/verify.controller';

const router = Router();

router.post('/verify', verifyCode);

export default router;
