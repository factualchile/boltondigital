import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { GoogleAdsApi } from "google-ads-api";
import { verifyUser } from "@/lib/auth-server";

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
});

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID missing" }, { status: 400 });

    // 1. VALIDACIÓN DE SEGURIDAD
    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const clientDb = supabaseAdmin || supabase;

    // 2. OBTENER CONFIGURACIÓN ACTUAL
    const { data: settings, error: sErr } = await clientDb
      .from('user_settings')
      .select('google_ads_id, current_campaign_id')
      .eq('user_id', userId)
      .single();

    if (sErr || !settings?.current_campaign_id || !settings?.google_ads_id) {
      return NextResponse.json({ error: "No se encontró una campaña activa para activar." }, { status: 404 });
    }

    const customerId = settings.google_ads_id.replace(/-/g, "");
    const campaignId = settings.current_campaign_id;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

    if (!refreshToken) throw new Error("Google Ads Refresh Token missing in environment");

    console.log(`[Activate] Iniciando activación de campaña ${campaignId} para cliente ${customerId}`);

    // 3. MUTACIÓN EN GOOGLE ADS
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    });

    const campaignResourceName = `customers/${customerId}/campaigns/${campaignId}`;

    await customer.campaigns.update([
      {
        resource_name: campaignResourceName,
        status: 'ENABLED',
      }
    ]);

    // 4. ACTUALIZAR PROGRESO EN SUPABASE
    await clientDb
      .from('user_progress')
      .upsert({ 
        user_id: userId, 
        category: 'clientes', 
        instance_key: 'activacion', 
        is_completed: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,category,instance_key' });

    console.log(`[Activate] Campaña ${campaignId} activada con éxito.`);

    return NextResponse.json({ 
      success: true, 
      message: "Campaña activada correctamente en Google Ads." 
    });

  } catch (error: any) {
    console.error("Activation Fatal Error:", error);
    return NextResponse.json({ error: error.message || "Error activando la campaña" }, { status: 500 });
  }
}
