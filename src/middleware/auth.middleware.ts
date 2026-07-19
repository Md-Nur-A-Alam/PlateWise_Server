import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiResponse';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized request: No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!process.env.BETTER_AUTH_SECRET) {
      throw new Error('BETTER_AUTH_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.BETTER_AUTH_SECRET) as any;
    const user = await User.findById(decoded.id || decoded.sub).select('-passwordHash');
    
    if (!user) {
      throw new ApiError(401, 'Invalid Token: User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
