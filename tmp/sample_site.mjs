import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];

const supabase = createClient(url, key);

async function checkSites() {
  const { data, error } = await supabase.from('client_sites').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample Site:', data);
  }
}

checkSites();
