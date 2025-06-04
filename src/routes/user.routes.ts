import express from 'express';
import multer from 'multer';

import { getUser, updateUser } from '@/controllers/user.controller';
import { updateProfileValidation } from '@/validations/user.validation';

const upload = multer();
const router = express.Router();

router.get('/', getUser);
router.put(
  '/update-profile',
  upload.single('file'),
  updateProfileValidation,
  updateUser,
);

export default router;
