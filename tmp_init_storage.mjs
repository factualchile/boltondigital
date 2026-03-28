import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://venjhgwafyufwdpwknmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbmpoZ3dhZnl1ZndkcHdrbm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkzODM5OCwiZXhwIjoyMDg4NTE0Mzk4fQ.1WvHsYE0AGPrXoMfuyK2jaB8noYmD4Gb1my16VQy94o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function init() {
  console.log("Intentando crear bucket 'landing-images'...");
  const { data, error } = await supabase.storage.createBucket('landing-images', {
    public: true,
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log("✅ El almacén ya existe.");
    } else {
      console.error("❌ Error:", error.message);
    }
  } else {
    console.log("✅ Almacén 'landing-images' creado con éxito y permisos públicos.");
  }
}

init();
