import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ApiError } from '../utils/apiResponse';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

import { asyncHandler } from '../utils/asyncHandler';

let JWKS: ReturnType<typeof createRemoteJWKSet>;

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
        const [key, val] = c.trim().split('=').map(decodeURIComponent);
        acc[key] = val;
        return acc;
      }, {});
      
      token = cookies['better-auth.session_token'] || '';
    }

    if (!token) {
      throw new ApiError(401, 'Unauthorized request: No token provided');
    }

    if (!process.env.CLIENT_URL) {
      throw new Error('CLIENT_URL is not defined in environment variables');
    }

    // Initialize JWKS if it hasn't been already
    if (!JWKS) {
      // BETTER_AUTH_URL is typically needed, we fall back to CLIENT_URL for the JWKS endpoint
      const authUrl = process.env.BETTER_AUTH_URL || process.env.CLIENT_URL;
      JWKS = createRemoteJWKSet(new URL(`${authUrl}/api/auth/jwks`));
    }

    const { payload } = await jwtVerify(token, JWKS);
    
    // JWT from better-auth usually has 'id' or 'sub' as the user ID
    const userId = payload.id || payload.sub;
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      throw new ApiError(401, 'Invalid Token: User not found');
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error("JWT Verification error:", error);
    next(new ApiError(401, 'Invalid or expired token'));
  }
});
