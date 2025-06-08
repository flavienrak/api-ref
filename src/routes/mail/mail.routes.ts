// routes/auth.ts ou autre fichier de routes
import { verifyToken } from '@/controllers/auth/token.controller';
import { verifyCode } from '@/controllers/auth/verify.controller';
import express from 'express';

const router = express.Router();

router.get('/:token/verify', verifyToken);
router.post('/verify', verifyCode);

export default router;
