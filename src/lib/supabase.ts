import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Please check Vercel Environment Variables or .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
