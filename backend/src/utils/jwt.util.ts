import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import mongoose from 'mongoose';

export const generateTokenAndSetCookie = (res: Response, userId: mongoose.Types.ObjectId) => {
  const token = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};
