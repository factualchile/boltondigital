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

    // 1. Obtener datos
    const { data: settings, error: settingsError } = await db
      .from('user_settings')
      .select('google_ads_id, campaign_survey, current_campaign_id')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.google_ads_id || !settings?.current_campaign_id) {
      return NextResponse.json({ error: "Configuración incompleta." }, { status: 400 });
    }

    const survey = settings.campaign_survey || {};
    const campaignId = settings.current_campaign_id;
    const phone = survey.phone || survey.whatsapp || "";
    
    if (!phone) throw new Error("No se encontró un teléfono de contacto en el perfil.");

    const customer = await getSmartCustomer(settings.google_ads_id);

    // 2. Crear el Asset de Llamada
    // Limpiar teléfono para Google (ej: +56912345678)
    const cleanPhone = phone.startsWith('+') ? phone : `+56${phone.replace(/\D/g, "")}`;

    const assetResponse = await customer.assets.create([{
      call_asset: {
        country_code: "CL", // Default Chile por contexto factualchile
        phone_number: cleanPhone,
        call_tracking_enabled: true
      },
      type: enums.AssetType.CALL,
      name: `Bolton Call: ${cleanPhone}`
    } as any]);

    const assetResourceName = (assetResponse.results[0] as any).resource_name;

    // 3. Vincular Asset a la Campaña
    const campaignResourceName = `customers/${settings.google_ads_id.replace(/-/g, "")}/campaigns/${campaignId}`;
    
    await customer.campaignAssets.create([{
      campaign: campaignResourceName,
      asset: assetResourceName,
      fieldType: enums.AssetFieldType.CALL
    }] as any);

    // 4. Marcar progreso
    await db.from('user_progress').upsert({
      user_id: userId,
      category: 'clientes',
      instance_key: 'leads', // Desafío #6
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, category, instance_key' });

    return NextResponse.json({ success: true, phone: cleanPhone });

  } catch (error: any) {
    console.error("Call Asset Setup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
