import { body } from 'express-validator';

const updateProfileValidation = [body('name').trim().optional()];

export { updateProfileValidation };
