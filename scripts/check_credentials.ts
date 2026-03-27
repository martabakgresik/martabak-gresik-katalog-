import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCredentials() {
  console.log("Checking credentials in Supabase...");
  const { data, error } = await supabase
    .from('store_settings')
    .select('admin_username, admin_password')
    .eq('id', 'main_config')
    .single();

  if (error) {
    console.error("Error fetching credentials:", error.message);
    return;
  }

  console.log("-----------------------------------------");
  console.log("CREDENTIALS FOUND:");
  console.log("Username:", data.admin_username);
  console.log("Password:", data.admin_password);
  console.log("-----------------------------------------");
}

checkCredentials();
