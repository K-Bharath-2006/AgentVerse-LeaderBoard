import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { generateTokenAndSetCookie } from '../utils/jwt.util';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, rollNumber, year, department, section } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      rollNumber,
      year,
      department,
      section,
    });

    if (user) {
      generateTokenAndSetCookie(res, user._id as any);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, juryId, password } = req.body;

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (juryId) {
      user = await User.findOne({ juryId });
    }

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account is blocked by admin');
    }

    const isMatch = await bcrypt.compare(password, user.password as string);

    if (isMatch) {
      generateTokenAndSetCookie(res, user._id as any);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        juryId: user.juryId,
        role: user.role,
        teamId: user.teamId,
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({
      _id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      juryId: req.user?.juryId,
      role: req.user?.role,
      teamId: req.user?.teamId,
    });
  } catch (error) {
    next(error);
  }
};
