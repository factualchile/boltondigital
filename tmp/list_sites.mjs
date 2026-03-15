import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];

const supabase = createClient(url, key);

async function checkSites() {
  console.log('Querying all client_sites...');
  const { data, error } = await supabase.from('client_sites').select('id, name');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sites in DB:', data);
  }
}

checkSites();
