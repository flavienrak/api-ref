import express from 'express';
import { google, callback } from '@/controllers/auth/google.controller';

const router = express.Router();

router.get('/google', google);
router.get('/google/callback', callback);

export default router;
