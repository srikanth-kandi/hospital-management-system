import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement authentication logic
  // For now, just pass through
  next();
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement admin authorization logic
  // For now, just pass through
  next();
}; 