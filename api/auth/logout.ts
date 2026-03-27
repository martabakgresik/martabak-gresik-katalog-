/**
 * 🚪 Logout API Route
 * 
 * File: api/auth/logout.ts
 * 
 * Endpoint untuk logout dan invalidate session
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface LogoutResponse {
  message?: string;
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<LogoutResponse>
): Promise<void> {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get token dari Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token is valid
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Auth] JWT_SECRET not configured');
      return res.status(500).json({ 
        error: 'Server configuration error' 
      });
    }

    try {
      jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }

    // Invalidate session di database
    const { error: updateError } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('token', token);

    if (updateError) {
      console.error('[Auth] Failed to invalidate session:', updateError);
      return res.status(500).json({ 
        error: 'Failed to logout' 
      });
    }

    // Clear auth cookie
    res.setHeader('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');

    return res.status(200).json({
      message: 'Logout berhasil',
    });
  } catch (error) {
    console.error('[Auth] Logout handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
