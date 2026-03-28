import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string || "anon";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase Admin client not initialized" }, { status: 500 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `professional-photos/${fileName}`;

    // Convert File to Buffer for Supabase Upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir usando el cliente Admin para saltar RLS
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('landing-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Obtener URL Pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('landing-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ success: true, publicUrl });

  } catch (error: any) {
    console.error("Storage Upload API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
