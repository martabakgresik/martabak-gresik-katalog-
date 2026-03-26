import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qohvacfwdsceoyvjtbdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaHZhY2Z3ZHNjZW95dmp0YmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDc1NjMsImV4cCI6MjA5MDEyMzU2M30.w-1OjXidwYL0A7FmUGFmFIWhKd7HbV5a1sT1GiWV2_8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPassword() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('admin_username, admin_password')
    .eq('id', 'main_config')
    .single()

  if (error) {
    console.error('Error fetching password:', error.message)
    return
  }

  console.log('--- KREDENSIAL DASHBOARD ANDA ---')
  console.log('Username:', data.admin_username)
  console.log('Password:', data.admin_password)
  console.log('---------------------------------')
}

checkPassword()
