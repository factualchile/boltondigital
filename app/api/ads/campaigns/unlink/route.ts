import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: "User ID missing" }, { status: 400 });

    // 1. VALIDACIÓN DE SEGURIDAD
    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    console.log(`[Unlink] Iniciando limpieza para usuario: ${userId}`);

    const supabaseAdmin = (await import("@/lib/supabase")).supabaseAdmin;
    const client = supabaseAdmin || supabase;

    // 2. LIMPIEZA ATÓMICA (Promesa Todo-o-Nada)
    const results = await Promise.all([
      // A. Resetear IDs y encuesta en settings
      client
        .from('user_settings')
        .update({ 
          current_campaign_id: null, 
          campaign_survey: null,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId),

      // B. Eliminar hitos de progreso vinculados a la campaña
      client
        .from('user_progress')
        .delete()
        .eq('user_id', userId)
        .in('instance_key', ['creacion', 'activacion', 'motor'])
    ]);

    // Verificar errores en las promesas
    const errors = results.filter(r => r.error);
    if (errors.length > 0) throw new Error(errors[0].error?.message || "Error during unlinking process");

    return NextResponse.json({ 
      success: true, 
      message: "Campaña desvinculada y progreso reseteado correctamente." 
    });

  } catch (error: any) {
    console.error("Unlink Fatal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
