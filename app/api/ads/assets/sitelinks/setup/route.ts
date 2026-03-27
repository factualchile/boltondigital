import { NextResponse } from "next/server";
import { getSmartCustomer, enums } from "@/lib/google-ads";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY });

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
      .select('google_ads_id, campaign_survey, current_campaign_id, landing_url')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.google_ads_id || !settings?.current_campaign_id || !settings?.landing_url) {
      return NextResponse.json({ error: "Configuración incompleta (Landing o Ads id faltante)." }, { status: 400 });
    }

    const survey = settings.campaign_survey || {};
    const campaignId = settings.current_campaign_id;
    const landingUrl = settings.landing_url;
    const customer = await getSmartCustomer(settings.google_ads_id);

    // 2. IA: Generar los Sitelinks
    const prompt = `Analiza este perfil profesional y genera 4 Enlaces de Sitio (Sitelinks) estratégicos.
    REGLAS:
    - Texto: Máx 25 caracteres.
    - Descripción 1: Máx 35 caracteres.
    - Descripción 2: Máx 35 caracteres.
    - Enfócate en servicios específicos o call-to-actions.

    Perfil:
    Profesión: ${survey.profession}
    Servicios: ${survey.specialties}
    Página: ${landingUrl}

    Responde ÚNICAMENTE con un JSON con el formato: { "sitelinks": [{ "text": "...", "desc1": "...", "desc2": "..." }] }`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message?.content || "{}");
    const sitelinksData = aiResult.sitelinks || [];

    if (sitelinksData.length === 0) throw new Error("La IA no pudo generar los sitelinks.");

    // 3. Crear los Assets en Google Ads
    const assetResourceNames: string[] = [];
    
    for (const link of sitelinksData) {
      const assetResponse = await customer.assets.create([{
        sitelink_asset: {
          ad_text: link.text.substring(0, 25),
          description1: link.desc1.substring(0, 35),
          description2: link.desc2.substring(0, 35)
        },
        type: enums.AssetType.SITELINK,
        final_urls: [landingUrl],
        name: `Bolton Sitelink: ${link.text}`
      } as any]);

      assetResourceNames.push((assetResponse.results[0] as any).resource_name);
    }

    // 4. Vincular Assets a la Campaña
    const campaignResourceName = `customers/${settings.google_ads_id.replace(/-/g, "")}/campaigns/${campaignId}`;
    
    const campaignAssetOperations = assetResourceNames.map(assetName => ({
      create: {
        campaign: campaignResourceName,
        asset: assetName,
        fieldType: enums.AssetFieldType.SITELINK
      }
    }));

    await customer.campaignAssets.create(campaignAssetOperations as any);

    // 5. Marcar progreso
    await db.from('user_progress').upsert({
      user_id: userId,
      category: 'clientes',
      instance_key: 'creativo', // Desafío #5
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, category, instance_key' });

    return NextResponse.json({ success: true, sitelinks: sitelinksData });

  } catch (error: any) {
    console.error("Sitelinks Setup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
