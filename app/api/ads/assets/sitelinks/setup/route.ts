import { NextResponse } from "next/server";
import { getSmartCustomer, enums } from "@/lib/google-ads";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";
import OpenAI from "openai";
import { canConsume, consumeTokens } from "@/lib/tokenomics";

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

    const landingUrl = settings.landing_url;
    
    // VALIDACIÓN DE DOMINIO: Google Ads exige URLs de alta autoridad para Sitelinks
    if (landingUrl.includes(".vercel.app") || landingUrl.includes(".amplifyapp.com")) {
      return NextResponse.json({ 
        error: "POLÍTICA DE DOMINIO: Para crear enlaces de sitio (Sitelinks) es obligatorio que tu página tenga un dominio propio vinculado (ej: www.tuweb.cl) en lugar de una URL de prueba de Vercel. Esto mejora drásticamente el CTR y la autoridad de tus anuncios."
      }, { status: 403 });
    }

    const survey = settings.campaign_survey || {};
    const campaignId = settings.current_campaign_id;
    const customer = await getSmartCustomer(settings.google_ads_id);

    // 2. IA: Generar los Sitelinks
    if (!await canConsume(userId)) {
       throw new Error("Saldo de Tokens insuficiente. Bolton está en pausa estratégica.");
    }

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
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    // Auditoría de Tokens
    const totalTokens = aiResponse.usage?.total_tokens || 1000;
    await consumeTokens(userId, totalTokens);

    const aiResult = JSON.parse(aiResponse.choices[0].message?.content || "{}");
    const sitelinksData = aiResult.sitelinks || [];

    if (sitelinksData.length === 0) throw new Error("La IA no pudo generar los sitelinks.");

    // 3. Crear los Assets en Google Ads
    const assetResourceNames: string[] = [];
    const timestamp = Date.now();
    let lastError = "";

    // Limpieza de URL
    let cleanLandingUrl = landingUrl.trim();
    if (!cleanLandingUrl.startsWith('http')) {
        cleanLandingUrl = `https://${cleanLandingUrl}`;
    }
    
    for (let i = 0; i < sitelinksData.length; i++) {
        const link = sitelinksData[i];
        const uniqueUrl = `${cleanLandingUrl}${cleanLandingUrl.includes('?') ? '&' : '?'}sl=${i+1}`;
        
        try {
            const assetResponse = await customer.assets.create([{
              sitelink_asset: {
                link_text: link.text.substring(0, 25),
                description1: link.desc1.substring(0, 35),
                description2: link.desc2.substring(0, 35)
              },
              type: enums.AssetType.SITELINK,
              final_urls: [uniqueUrl],
              name: `Bolton Sitelink ${timestamp}-${i}: ${link.text}`.substring(0, 80)
            } as any]);

            if (assetResponse.results && assetResponse.results[0]) {
              assetResourceNames.push((assetResponse.results[0] as any).resource_name);
            }
        } catch (assetErr: any) {
            console.warn(`[Sitelinks] Error creando asset ${i}:`, assetErr.message);
            lastError = assetErr.message || JSON.stringify(assetErr);
        }
    }

    if (assetResourceNames.length === 0) {
        throw new Error(`Google Ads rechazó los enlaces: ${lastError || "Error de validación de URL o textos"}`);
    }

    // 4. Vincular Assets a la Campaña
    const campaignResourceName = `customers/${settings.google_ads_id.replace(/-/g, "")}/campaigns/${campaignId}`;
    
    const campaignAssetOperations = assetResourceNames.map(assetName => ({
      campaign: campaignResourceName,
      asset: assetName,
      field_type: enums.AssetFieldType.SITELINK
    }));

    try {
        console.log(`[Sitelinks] Vinculando ${assetResourceNames.length} assets a la campaña ${campaignId}`);
        await customer.campaignAssets.create(campaignAssetOperations as any);
    } catch (linkErr: any) {
        console.error("[Sitelinks] Error vinculando sitelinks:", linkErr);
        if (!linkErr.message?.includes("ALREADY_EXISTS")) {
            throw new Error(`Error vinculación Sitelinks: ${linkErr.message}`);
        }
    }

    // 5. Marcar progreso
    await db.from('user_progress').upsert({
      user_id: userId,
      category: 'clientes',
      instance_key: 'creativo', 
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, category, instance_key' });

    return NextResponse.json({ 
        success: true, 
        sitelinks: sitelinksData,
        message: "Enlaces de sitio creados y vinculados correctamente."
    });

  } catch (error: any) {
    console.error("Sitelinks Setup Detailed Error:", error);
    let finalMsg = error.message;

    if (error.errors && Array.isArray(error.errors)) {
      finalMsg = `${error.message}: ${error.errors[0]?.message} (${error.errors[0]?.location?.field_path_elements?.map((e:any) => e.field_name).join('.')})`;
    }

    return NextResponse.json({ 
        success: false,
        error: finalMsg || "Error desconocido al configurar los enlaces de sitio." 
    }, { status: 500 });
  }
}
