import express from 'express';

import {
  loginValidation,
  registerValidation,
} from '@/validations/auth.validation';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import { login, logout, register } from '@/controllers/auth/auth.controller';

const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/logout', logout);

export default router;
