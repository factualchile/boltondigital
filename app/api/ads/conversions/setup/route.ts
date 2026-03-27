import { NextResponse } from "next/server";
import { getSmartCustomer, enums } from "@/lib/google-ads";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
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

    if (settingsError || !settings?.google_ads_id) {
      return NextResponse.json({ error: "Google Ads ID not found. Connect your account first." }, { status: 400 });
    }

    const customer = await getSmartCustomer(settings.google_ads_id);
    const customerId = settings.google_ads_id.replace(/-/g, "");

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
      const createResponse = await customer.conversionActions.create({
        name: "Bolton Lead",
        type: enums.ConversionActionType.WEBPAGE,
        category: enums.ConversionActionCategory.CONTACT,
        status: enums.ConversionActionStatus.ENABLED,
        view_through_lookback_window_days: 1,
        click_through_lookback_window_days: 30,
      } as any);

      resourceName = (createResponse.results[0] as any).resource_name;
      
      // Consultar el ID recién creado
      const newAction = await customer.query(`
        SELECT conversion_action.id FROM conversion_action WHERE conversion_action.resource_name = '${resourceName}'
      `);
      conversionActionId = (newAction[0] as any).conversion_action.id.toString();
    }

    // 4. Obtener el Conversion ID Global (Tag ID) de la cuenta
    const customerQuery = await customer.query(`
      SELECT customer.conversion_tracking_setting.google_ads_conversion_id 
      FROM customer
    `);
    
    // google_ads_conversion_id es el número que va en AW-XXXXXXXXX
    const googleAdsConversionId = (customerQuery[0] as any).customer.conversion_tracking_setting?.google_ads_conversion_id?.toString() || "";

    // 5. Obtener el LABEL de la acción
    // El label está en los tag_snippets
    const snippetQuery = await customer.query(`
      SELECT conversion_action.tag_snippets 
      FROM conversion_action 
      WHERE conversion_action.resource_name = '${resourceName}'
    `);

    let conversionLabel = "";
    const snippets = (snippetQuery[0] as any).conversion_action.tag_snippets;
    if (snippets && snippets.length > 0) {
      // Buscamos el snippet que tiene el event_snippet
      const eventSnippet = snippets.find((s: any) => s.type === enums.TrackingCodeType.WEBPAGE && s.event_snippet);
      if (eventSnippet?.event_snippet) {
        // El snippet contiene: gtag('event', 'conversion', {'send_to': 'AW-12345/ABCDE'});
        const match = eventSnippet.event_snippet.match(/AW-\d+\/([^']+)/);
        if (match) conversionLabel = match[1];
      }
    }

    // Fallback si no encontramos label (poco probable con Bolton Lead recién creado)
    if (!conversionLabel) {
       // A veces el label es simplemente el nombre o algo predecible, 
       // pero mejor error si no lo pillamos para no inyectar basura.
       return NextResponse.json({ error: "Could not retrieve conversion label from Google Ads." }, { status: 500 });
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

    // 7. Marcar progreso del desafío
    await db.from('user_progress').upsert({
      user_id: userId,
      category: 'clientes',
      instance_key: 'escalamiento',
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, category, instance_key' });

    return NextResponse.json({ 
      success: true, 
      conversionConfig,
      message: "Configuración de conversión completada y vinculada."
    });

  } catch (error: any) {
    console.error("Conversion Setup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
