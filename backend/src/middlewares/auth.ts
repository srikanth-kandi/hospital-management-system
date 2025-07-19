import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Then check if user is admin
    if (req.user.role !== 'hospital_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization error' });
  }
};

export const doctorMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Then check if user is doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Doctor access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization error' });
  }
}; 