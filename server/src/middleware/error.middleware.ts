import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (err.name === 'MongoError' || err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
};
