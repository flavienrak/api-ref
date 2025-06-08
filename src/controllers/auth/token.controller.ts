import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET_KEY as string;

export const verifyToken = (req: Request, res: Response): void => {
  try {
    const { token } = req.params;

    if (!token) {
      res.json({ message: 'Aucun token fourni' });
      return;
    }

    const decoded = jwt.verify(token, secretKey);
    res.status(200).json({ payload: decoded });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.json({ expired: true });
    } else {
      res.status(500).json(error);
    }
  }
};
