import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';
import nodemailer from 'nodemailer';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const secretKey = process.env.JWT_SECRET_KEY!;
const authTokenName = process.env.AUTH_TOKEN_NAME!;
const maxAgeAuthToken = 3 * 24 * 60 * 60;

// Connexion
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const { email, password }: { email: string; password: string } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.json({ userNotFound: true });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.json({ incorrectPassword: true });
      return;
    }

    const payload = {
      id: user.id,
      authToken: true,
    };

    const token = jwt.sign({ infos: payload }, secretKey, {
      expiresIn: maxAgeAuthToken,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: maxAgeAuthToken * 1000,
    };

    res.cookie(authTokenName, token, cookieOptions);
    res.status(200).json({ user: { id: user.id } });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Inscription
const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    const {
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.json({ userAlreadyExist: true });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: 'Card',
      to: email,
      subject: 'Code de verification',
      html: `<p>Bonjour ${name}, votre code de vérification est : <strong >${code}</strong>.</p>`,
    });

    const payload = {
      id: newUser.id,
      code: code,
    };

    const token = jwt.sign({ infos: payload }, secretKey, {
      expiresIn: maxAgeAuthToken,
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Déconnexion
const logout = async (req: Request, res: Response) => {
  res.clearCookie(authTokenName, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ loggedOut: true });
};

export { login, register, logout };
