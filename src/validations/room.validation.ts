// validations/room.ts
import { body } from 'express-validator';

export const createRoomValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .notEmpty()
    .withMessage('Email requis'),
];

export const joinRoomValidation = [
  body('roomCode').notEmpty().withMessage('Code de la room requis'),

  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .notEmpty()
    .withMessage('Email requis'),

  body('name').notEmpty().withMessage('Nom requis'),
];
