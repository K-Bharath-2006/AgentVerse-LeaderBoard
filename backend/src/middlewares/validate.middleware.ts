import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues?.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })) || error.errors,
      });
    }
  };
