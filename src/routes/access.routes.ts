import {
  sendVerificationCode,
  verifyCode,
} from '@/controllers/access.controller';
import {
  sendCodeValidation,
  verifyCodeValidation,
} from '@/validations/access.validation';
import express from 'express';

const router = express.Router();

router.post('/auth/send-code', sendCodeValidation, sendVerificationCode);
router.post('/auth/verify-code', verifyCodeValidation, verifyCode);

export default router;
