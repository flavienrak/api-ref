import express from 'express';
import {
  google,
  callback,
  verifyToken,
} from '@/controllers/auth/google.controller';

const router = express.Router();

router.get('/', google);
router.get('/callback', callback);
router.get('/verify', verifyToken);
export default router;
