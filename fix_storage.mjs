import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://venjhgwafyufwdpwknmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbmpoZ3dhZnl1ZndkcHdrbm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkzODM5OCwiZXhwIjoyMDg4NTE0Mzk4fQ.1WvHsYE0AGPrXoMfuyK2jaB8noYmD4Gb1my16VQy94o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log("Intentando convertir bucket 'landing-images' a PÚBLICO...");
  const { data, error } = await supabase.storage.updateBucket('landing-images', {
    public: true,
  });
  
  if (error) {
    console.error("❌ Error de Supabase:", error.message);
  } else {
    console.log("✅ Almacén 'landing-images' ahora es PÚBLICO y accesible.");
  }
}

fix();
