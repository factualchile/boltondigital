import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase Admin not available. Check service role key." }, { status: 500 });
    }

    // 1. Crear Bucket 'landing-images' if not exists
    const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.createBucket('landing-images', {
      public: true, // Importante para que OpenAI pueda ver la imagen via URL
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        return NextResponse.json({ success: true, message: "Bucket already exists" });
      }
      throw bucketError;
    }

    return NextResponse.json({ success: true, message: "Bucket 'landing-images' created successfully" });

  } catch (error: any) {
    console.error("Storage Init Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
