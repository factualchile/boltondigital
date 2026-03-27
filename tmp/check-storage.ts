import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
    const { data, error } = await supabase.storage.listBuckets();
    console.log("Buckets:", data?.map(b => b.name));
    
    if (data && !data.find(b => b.name === 'landing-images')) {
        console.log("Creating bucket 'landing-images'...");
        const { error: createError } = await supabase.storage.createBucket('landing-images', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
        });
        if (createError) console.error("Error creating bucket:", createError);
        else console.log("Bucket created successfully!");
    }
}

checkBucket();
