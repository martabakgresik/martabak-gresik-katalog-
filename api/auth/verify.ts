/**
 * 🔐 Verify Token API Route
 * 
 * File: api/auth/verify.ts
 * 
 * Endpoint untuk verify apakah token masih valid
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwt from 'jsonwebtoken';

interface VerifyResponse {
  valid: boolean;
  user?: {
    sub: string;
    username: string;
    email: string;
  };
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      valid: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Get token dari Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        valid: false,
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Auth] JWT_SECRET not configured');
      return res.status(500).json({ 
        valid: false,
        error: 'Server configuration error' 
      });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      
      return res.status(200).json({
        valid: true,
        user: decoded as any,
      });
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          valid: false,
          error: 'Token expired' 
        });
      }

      return res.status(401).json({ 
        valid: false,
        error: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('[Auth] Verify handler error:', error);
    return res.status(500).json({ 
      valid: false,
      error: 'Internal server error' 
    });
  }
}
