/**
 * 🔐 Login API Route untuk Vercel
 * 
 * File: api/auth/login.ts
 * 
 * Environment Variables Needed:
 * - VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (do NOT use anon key!)
 * - JWT_SECRET
 * 
 * Install: npm install jsonwebtoken bcrypt
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

// Initialize Supabase dengan SERVICE ROLE KEY
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface LoginRequestBody {
  username: string;
  password: string;
}

interface LoginResponseBody {
  token?: string;
  expiresIn?: number;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  error?: string;
}

/**
 * Rate limiting helper
 * Check apakah IP ini sudah banyak login attempts
 */
async function checkRateLimit(
  ipAddress: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<boolean> {
  const windowMs = windowMinutes * 60 * 1000;
  const cutoffTime = new Date(Date.now() - windowMs).toISOString();

  const { data: attempts } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact' })
    .eq('ip_address', ipAddress)
    .eq('success', false)
    .gt('attempted_at', cutoffTime);

  return (attempts?.length || 0) < maxAttempts;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    } as LoginResponseBody);
  }

  try {
    const { username, password } = req.body as LoginRequestBody;
    const ipAddress = 
      (req.headers['x-forwarded-for'] as string) || 
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username dan password harus diisi' 
      } as LoginResponseBody);
    }

    // Username validation
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        error: 'Username harus 3-50 karakter' 
      } as LoginResponseBody);
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password terlalu pendek' 
      } as LoginResponseBody);
    }

    // Rate limiting check
    const isAllowed = await checkRateLimit(ipAddress);
    if (!isAllowed) {
      // Log attempt
      await supabase.from('login_attempts').insert({
        username,
        ip_address: ipAddress,
        success: false,
      });

      return res.status(429).json({ 
        error: 'Terlalu banyak percobaan login. Coba lagi nanti.' 
      } as LoginResponseBody);
    }

    // Query admin user dari database
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('id, username, email, password_hash, is_active')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    // --- FALLBACK KE .ENV HASH JIKA DB KOSONG/GAGAL ---
    if (queryError || !adminUser) {
      const adminHash = process.env.VITE_ADMIN_PASSWORD_HASH;
      if (adminHash && username === 'admin') {
        const inputHash = crypto.createHash('sha256').update(password).digest('hex');
        
        if (inputHash === adminHash) {
          // Generate JWT untuk login via .env fallback
          const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
          const token = jwt.sign(
            { sub: 'env_admin', username: 'admin', email: 'admin@fallback.com' },
            jwtSecret,
            { expiresIn: '8h' }
          );

          res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800; Path=/`);
          return res.status(200).json({ token, user: { id: 'env_admin', username: 'admin', email: 'admin@fallback.com' } });
        }
      }

      // Log failed attempt
      await supabase.from('login_attempts').insert({
        username,
        ip_address: ipAddress,
        success: false,
      });

      return res.status(401).json({ 
        error: 'Username atau password salah' 
      } as LoginResponseBody);
    }

    // Verify password menggunakan bcrypt (Standard Flow)
    const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);
    if (!isPasswordValid) {
      console.warn(`[Auth] Failed login attempt for user: ${username} (Invalid password)`);
      return res.status(401).json({ 
        error: 'Username atau password salah' 
      } as LoginResponseBody);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Auth] JWT_SECRET not configured');
      return res.status(500).json({ 
        error: 'Server configuration error' 
      } as LoginResponseBody);
    }

    const token = jwt.sign(
      {
        sub: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
      },
      jwtSecret,
      { expiresIn: '8h' } // 8 hours
    );

    // Save session to database
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const { error: sessionError } = await supabase.from('admin_sessions').insert({
      admin_id: adminUser.id,
      token,
      ip_address: ipAddress,
      user_agent: (req.headers['user-agent'] as string) || 'unknown',
      expires_at: expiresAt.toISOString(),
    });

    if (sessionError) {
      console.error('[Auth] Failed to save session:', sessionError);
      return res.status(500).json({ 
        error: 'Failed to create session' 
      } as LoginResponseBody);
    }

    // Log successful attempt
    await supabase.from('login_attempts').insert({
      username,
      ip_address: ipAddress,
      success: true,
    });

    // Set httpOnly cookie (lebih aman dari localStorage)
    const cookieMaxAge = 8 * 60 * 60; // 8 hours
    res.setHeader('Set-Cookie', 
      `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${cookieMaxAge}; Path=/`
    );

    return res.status(200).json({
      token,
      expiresIn: cookieMaxAge,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
      },
    } as LoginResponseBody);
  } catch (error) {
    console.error('[Auth] Login handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    } as LoginResponseBody);
  }
}
