import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testQuery() {
  const id = 'bf5bbdf2-06bc-480a-932b-91506cbeb18f';
  console.log('Querying for ID:', id);
  
  const { data, error } = await supabase
    .from('client_sites')
    .select('*')
    .eq('id', id);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data found:', data);
    console.log('Count:', data?.length);
  }
}

testQuery();
