import { createClient } from '@supabase/supabase-js';

// Safe Hybrid Approach for Environment Variables
// Vite requires VITE_ prefix for client-side, but Vercel sometimes uses SUPABASE_URL.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 
                    (import.meta as any).env?.SUPABASE_URL || 
                    '';

const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
                        (import.meta as any).env?.SUPABASE_ANON_KEY || 
                        '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Check Vercel Dashboard Settings -> Environment Variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
