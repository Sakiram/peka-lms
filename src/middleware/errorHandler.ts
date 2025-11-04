import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const status = err.statusCode || 500;
  const message = err.isOperational && err.message ? err.message : 'Internal Server Error';
  res.status(status).json({ success: false, status, message });
};
