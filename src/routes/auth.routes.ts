import express from 'express';

import {
  loginValidation,
  registerValidation,
} from '@/validations/auth.validation';
import {
  login,
  logout,
  oauthRegister,
  register,
} from '@/controllers/auth/auth.controller';
import { checkConnectionStatus } from '@/controllers/auth/isConnected.controller';
import { authenticateUser } from '@/middlewares/auth.middleware';

const router = express.Router();

router.post('/login', loginValidation, login);
router.get('/status', authenticateUser, checkConnectionStatus);
router.post('/register', registerValidation, register);
router.post('/oauth-register', oauthRegister);
router.get('/logout', logout);

export default router;
