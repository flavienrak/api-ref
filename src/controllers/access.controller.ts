import prisma from '@/lib/db';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export async function sendVerificationCode(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const body: { name: string; email: string } = req.body;
    // if (!body.email || !body.name) {
    //   res.status(400).json({ error: 'Email et nom requis' });
    //   return;
    // }

    let user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: body.name, email: body.email },
      });
    }

    await prisma.verificationCode.deleteMany({ where: { email: body.email } });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        email: body.email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Ton App" <${process.env.GMAIL_USER}>`,
      to: body.email,
      subject: 'Votre code de verification',
      html: `<p>Bonjour ${body.name}, voici votre code : <strong >${code} </strong>.</p>`,
    });

    res.json({ message: 'Email envoyé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur envoi mail' });
  }
}

export async function verifyCode(req: Request, res: Response) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const body: { email: string; code: string } = req.body;
    // if (!body.email || !body.code) {
    //   res.status(400).json({ error: 'Email et code requis' });
    //   return;
    // }

    const record = await prisma.verificationCode.findUnique({
      where: { email: body.email },
    });

    if (!record || record.code !== body.code || record.expiresAt < new Date()) {
      res.status(400).json({ error: 'Code invalide ou expiré' });
      return;
    }

    await prisma.user.update({
      where: { email: body.email },
      data: { isVerified: true },
    });

    await prisma.verificationCode.delete({ where: { email: body.email } });

    res.json({ message: 'Code validé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la vérification du code' });
  }
}
