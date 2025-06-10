import { verifyToken } from '@/controllers/mail/token.controller';
import express from 'express';
const router = express.Router();

router.get('/:token', verifyToken);

export default router;
