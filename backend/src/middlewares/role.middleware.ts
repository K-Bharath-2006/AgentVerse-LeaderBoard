import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role ${req.user.role} is not authorized to access this route`));
    }

    next();
  };
};
