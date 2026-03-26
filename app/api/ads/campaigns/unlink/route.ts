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

    console.log(`[Bolton Debug] Iniciando desvinculación para: ${userId}`);

    // Usamos supabaseAdmin para saltarnos RLS y asegurar acceso total al esquema
    const client = supabaseAdmin || supabase;

    // 2. DIAGNÓSTICO PREVENTIVO (¿La columna es visible?)
    const { data: testData, error: testError } = await client
      .from('user_settings')
      .select('campaign_survey, current_campaign_id')
      .eq('user_id', userId)
      .single();

    if (testError) {
      console.warn("[Bolton Debug] La columna no es visible vía SELECT:", testError);
    } else {
      console.log("[Bolton Debug] La columna EXISTE y es accesible para lectura.");
    }

    // 3. LIMPIEZA ATÓMICA (Promesa Todo-o-Nada)
    // Usamos camelCase o snake_case dependiendo de cómo esté la tabla
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

      // B. Eliminar hitos de progreso vinculados a la campaña para permitir reinicio
      client
        .from('user_progress')
        .delete()
        .eq('user_id', userId)
        .in('instance_key', ['creacion', 'activacion', 'motor'])
    ]);

    // Verificar errores en las promesas
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      const dbError = errors[0].error;
      console.error("[Unlink Error Detail]:", dbError);
      
      // FALLBACK: Si falla por 'campaign_survey', intentamos vaciar solo el ID de campaña
      if (dbError?.message?.includes("campaign_survey")) {
          console.warn("[Bolton Debug] Fallback: Intentando actualizar solo el ID de campaña...");
          const { error: fallbackError } = await client
            .from('user_settings')
            .update({ current_campaign_id: null, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
            
          if (fallbackError) throw new Error(`Fallo total (incluida recuperación): ${fallbackError.message}`);
          
          return NextResponse.json({ 
            success: true, 
            warning: "Se desvinculó la campaña pero los datos de la encuesta se mantuvieron por un error de esquema en Supabase. Puedes continuar.",
            message: "Campaña desvinculada (modo recuperación)." 
          });
      }

      throw new Error(dbError?.message || "Error during unlinking process");
    }

    return NextResponse.json({ 
      success: true, 
      message: "Campaña desvinculada y terreno despejado para una nueva estrategia." 
    });

  } catch (error: any) {
    console.error("Unlink Fatal Error:", error);
    return NextResponse.json({ 
      error: error.message,
      hint: "Si el error menciona 'schema cache', ejecuta 'ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS campaign_survey JSONB; NOTIFY pgrst, reload schema;' en tu editor SQL de Supabase."
    }, { status: 500 });
  }
}
