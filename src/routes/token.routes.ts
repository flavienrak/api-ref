import { Oauth, verifyToken } from '@/controllers/mail/token.controller';
import express from 'express';
const router = express.Router();

//verification token sent via mail
router.get('/:token', verifyToken);

//verification token with google Oauth
router.get('/:token/oauth', Oauth);
export default router;
