// routes/auth.ts ou autre fichier de routes
import { verifyToken } from '@/controllers/auth/token.controller';
import express from 'express';

const router = express.Router();

router.get('/:token/verify', verifyToken);

export default router;
