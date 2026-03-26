import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  console.log("Inspecting user_settings table...");
  const { data, error } = await supabase.from('user_settings').select().limit(1);
  if (error) {
    console.error("Error fetching data:", error);
    // If select(*) fails because of one missing column in cache, we try to get all columns via RPC or metadata
    return;
  }
  if (data && data.length > 0) {
    console.log("Keys found in first row:", Object.keys(data[0]));
  } else {
    console.log("Table is empty, trying to insert a dummy to see if it fails...");
    // We can't insert a dummy without knowing some required fields like user_id
  }
}

inspectTable();
