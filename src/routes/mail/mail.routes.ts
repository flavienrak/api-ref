// routes/auth.ts ou autre fichier de routes
import { verifyToken } from '@/controllers/auth/token.controller';
import { verifyCode } from '@/controllers/auth/verify.controller';
import express from 'express';

const router = express.Router();

router.get('/:token', verifyToken);
router.post('/:token/code', verifyCode);

export default router;
