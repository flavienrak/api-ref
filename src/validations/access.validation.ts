// validations/code.ts
import { body } from 'express-validator';

export const sendCodeValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .notEmpty()
    .withMessage('Email requis'),
  body('name').notEmpty().withMessage('Nom requis'),
];

export const verifyCodeValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .notEmpty()
    .withMessage('Email requis'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Le code doit contenir 6 chiffres')
    .matches(/^\d+$/)
    .withMessage('Le code doit être composé uniquement de chiffres'),
];
