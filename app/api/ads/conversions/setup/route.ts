import { NextResponse } from "next/server";
import { getSmartCustomer, enums } from "@/lib/google-ads";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { userId, googleAdsId: reqAdsId } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID missing" }, { status: 400 });

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const db = supabaseAdmin || supabase;

    // 1. Obtener settings del usuario
    const { data: settings, error: settingsError } = await db
      .from('user_settings')
      .select('google_ads_id, conversion_config')
      .eq('user_id', userId)
      .single();

    let finalAdsId = settings?.google_ads_id || reqAdsId;

    if (!finalAdsId) {
      return NextResponse.json({ error: "Google Ads ID not found. Connect your account first." }, { status: 400 });
    }

    // Auto-reparación si faltaba en DB pero venía en request
    if (!settings?.google_ads_id && reqAdsId) {
      console.log(`[Self-Repair] Actualizando google_ads_id faltante para usuario ${userId}`);
      await db.from('user_settings').upsert({ user_id: userId, google_ads_id: reqAdsId }, { onConflict: 'user_id' });
    }

    const customer = await getSmartCustomer(finalAdsId);
    const customerId = finalAdsId.replace(/-/g, "");

    // 2. Verificar si ya existe "Bolton Lead"
    const existingSearch = await customer.query(`
      SELECT conversion_action.id, conversion_action.resource_name, conversion_action.name 
      FROM conversion_action 
      WHERE conversion_action.name = 'Bolton Lead' 
      AND conversion_action.status = 'ENABLED'
    `);

    let conversionActionId: string;
    let resourceName: string;

    if (existingSearch.length > 0) {
      const firstAction = existingSearch[0] as any;
      conversionActionId = firstAction.conversion_action.id.toString();
      resourceName = firstAction.conversion_action.resource_name;
    } else {
      // 3. Crear la acción de conversión
      const createResponse = await customer.conversionActions.create([
        {
          name: "Bolton Lead",
          type: enums.ConversionActionType.WEBPAGE,
          category: enums.ConversionActionCategory.CONTACT,
          status: enums.ConversionActionStatus.ENABLED,
          view_through_lookback_window_days: 1,
          click_through_lookback_window_days: 30,
        } as any
      ]);

      resourceName = (createResponse.results[0] as any).resource_name;
      
      // Consultar el ID recién creado
      const newAction = await customer.query(`
        SELECT conversion_action.id FROM conversion_action WHERE conversion_action.resource_name = '${resourceName}'
      `);
      conversionActionId = (newAction[0] as any).conversion_action.id.toString();
    }

    // 4 & 5. Obtener el LABEL y el Global Conversion ID (Tag ID) de la acción
    // Lo extraemos directamente del snippet de la acción de conversión para evitar errores de consulta en el recurso 'customer'
    const snippetQuery = await customer.query(`
      SELECT conversion_action.tag_snippets 
      FROM conversion_action 
      WHERE conversion_action.resource_name = '${resourceName}'
    `);

    if (!snippetQuery || snippetQuery.length === 0) {
      throw new Error(`No se encontró el snippet para la acción ${resourceName}`);
    }

    let conversionLabel = "";
    let googleAdsConversionId = "";
    const snippets = (snippetQuery[0] as any).conversion_action.tag_snippets;
    
    if (snippets && snippets.length > 0) {
      // Buscamos el snippet que tiene el event_snippet
      const eventSnippet = snippets.find((s: any) => s.type === enums.TrackingCodeType.WEBPAGE && s.event_snippet);
      if (eventSnippet?.event_snippet) {
        // El snippet contiene: gtag('event', 'conversion', {'send_to': 'AW-12345/ABCDE'});
        const match = eventSnippet.event_snippet.match(/AW-(\d+)\/([^']+)/);
        if (match) {
            googleAdsConversionId = match[1];
            conversionLabel = match[2];
        }
      }
    }

    // Fallback si no encontramos nada (muy poco probable si la acción se creó bien)
    if (!conversionLabel || !googleAdsConversionId) {
       console.log(`[ConversionSetup] Snippets raw:`, JSON.stringify(snippets));
       return NextResponse.json({ error: "No se pudo extraer la configuración de conversión de Google Ads automáticamente. Revisa que tu cuenta tenga el etiquetado global activo." }, { status: 500 });
    }

    // 6. Guardar configuración en Supabase
    const conversionConfig = {
      googleAdsConversionId,
      conversionLabel,
      actionId: conversionActionId,
      updatedAt: new Date().toISOString()
    };

    const { error: updateError } = await db
      .from('user_settings')
      .update({ conversion_config: conversionConfig })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // 7. Marcar progreso del desafío y notificar
    // Consultamos estado previo para no reenviar correos
    const { data: existingProgress } = await db
      .from('user_progress')
      .select('is_completed')
      .eq('user_id', userId)
      .eq('category', 'clientes')
      .eq('instance_key', 'escalamiento')
      .single();

    const wasCompleted = existingProgress?.is_completed || false;

    await db.from('user_progress').upsert({
      user_id: userId,
      category: 'clientes',
      instance_key: 'escalamiento',
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, category, instance_key' });

    // Enviar notificación si es la primera vez que se completa
    if (!wasCompleted) {
      try {
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          const token = authHeader.replace("Bearer ", "");
          const { data: { user: authUser } } = await supabase.auth.getUser(token);
          
          if (authUser?.email) {
            const { sendConversionSuccessEmail } = await import("@/lib/resend");
            await sendConversionSuccessEmail(authUser.email);
            console.log(`[Bolton Notification] Correo de conversiones enviado a ${authUser.email}`);
          }
        }
      } catch (e) {
        console.error("Fallo no crítico al enviar correo de conversiones:", e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      conversionConfig,
      message: "Configuración de conversión completada y vinculada."
    });

  } catch (error: any) {
    console.error("Conversion Setup Detailed Error:", error);
    let finalMsg = error.message;
    
    // Si el error es de la librería Google Ads, a veces viene en 'errors'
    if (!finalMsg && error.errors && Array.isArray(error.errors)) {
      finalMsg = error.errors[0]?.message;
    }

    return NextResponse.json({ 
      success: false,
      error: finalMsg || "Error desconocido en el servidor de conversiones" 
    }, { status: 500 });
  }
}
