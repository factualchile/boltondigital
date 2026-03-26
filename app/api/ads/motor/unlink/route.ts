import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: "User ID missing" }, { status: 400 });

    // 1. VALIDACIÓN DE SEGURIDAD
    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    console.log(`[Motor Unlink] Iniciando desvinculación de cuenta para: ${userId}`);

    const client = supabaseAdmin || supabase;

    // 2. LIMPIEZA ATÓMICA
    const results = await Promise.all([
      // A. Resetear Google Ads ID
      client
        .from('user_settings')
        .update({ 
          google_ads_id: null, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId),

      // B. Resetear hito de motor
      client
        .from('user_progress')
        .delete()
        .eq('user_id', userId)
        .eq('instance_key', 'motor')
    ]);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) throw new Error(errors[0].error?.message || "Error during unlinking process");

    return NextResponse.json({ 
      success: true, 
      message: "Cuenta de Google Ads desvinculada correctamente." 
    });

  } catch (error: any) {
    console.error("Motor Unlink Fatal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
