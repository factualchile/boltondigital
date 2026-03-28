import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSettings() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
  
  console.log('--- DEBUG USER SETTINGS ---')
  console.log('Count:', data?.length)
  console.log('Rows:', JSON.stringify(data, null, 2))
  if (error) console.error('Error:', error)
}

debugSettings()
