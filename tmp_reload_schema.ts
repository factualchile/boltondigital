import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reloadSchema() {
  console.log("Attempting to reload PostgREST schema cache...");
  const { data, error } = await supabase.rpc('reload_schema_cache').catch(() => ({ data: null, error: { message: "RPC not found" } }));
  
  if (error) {
    console.log("RPC failed (expected if not defined), trying raw notify...");
    // Fallback: This might not work from client, but worth a try via a query if possible
    // Since we can't do raw SQL easily via the client without an RPC, we'll try to touch the table.
    const { error: touchError } = await supabase.from('user_settings').select('campaign_survey').limit(1);
    if (touchError) {
        console.error("Touch error:", touchError);
    } else {
        console.log("Column 'campaign_survey' IS accessible via SELECT.");
    }
  }
}

reloadSchema();
