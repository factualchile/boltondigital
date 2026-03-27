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

    // 1. Obtener datos del profesional
    const { data: settings, error: settingsError } = await db
      .from('user_settings')
      .select('google_ads_id, campaign_survey, current_campaign_id')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.google_ads_id || !settings?.current_campaign_id) {
      return NextResponse.json({ error: "Configuración incompleta. Asegúrate de tener una campaña activa." }, { status: 400 });
    }

    const survey = settings.campaign_survey || {};
    const campaignId = settings.current_campaign_id;
    const customer = await getSmartCustomer(settings.google_ads_id);

    // 2. IA: Generar los Textos Destacados (Callouts)
    const prompt = `Analiza este perfil profesional y genera exactamente 4 "Textos Destacados" (Callouts) para anuncios de Google Ads. 
    REGLA CRÍTICA: Cada texto debe tener MÁXIMO 25 caracteres.
    REGLA CRÍTICA: Enfócate en beneficios, experiencia y confianza.
    
    Perfil:
    Profesión: ${survey.profession || "Psicólogo"}
    Especialidades: ${Array.isArray(survey.specialties) ? survey.specialties.join(", ") : survey.specialties || ""}
    Slogan: ${survey.slogan || ""}
    Experiencia: ${survey.profession || ""}
    
    Responde ÚNICAMENTE con un JSON con el formato: { "callouts": ["texto1", "texto2", "texto3", "texto4"] }`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message?.content || "{}");
    const calloutTexts: string[] = aiResult.callouts || [];

    if (calloutTexts.length === 0) throw new Error("La IA no pudo generar los textos destacados.");

    // 3. Crear los Assets en Google Ads
    const assetResourceNames: string[] = [];
    
    for (const text of calloutTexts) {
      const trimmedText = text.substring(0, 25); // Safe guard
      const assetResponse = await customer.assets.create([{
        callout_asset: {
          callout_text: trimmedText
        },
        type: enums.AssetType.CALLOUT,
        name: `Bolton Callout: ${trimmedText}`
      } as any]);

      assetResourceNames.push(assetResourceNames[0] || (assetResponse.results[0] as any).resource_name);
      assetResourceNames[assetResourceNames.length - 1] = (assetResponse.results[0] as any).resource_name;
    }

    // 4. Vincular Assets a la Campaña
    const campaignResourceName = `customers/${settings.google_ads_id.replace(/-/g, "")}/campaigns/${campaignId}`;
    
    const campaignAssetOperations = assetResourceNames.map(assetName => ({
      create: {
        campaign: campaignResourceName,
        asset: assetName,
        fieldType: enums.AssetFieldType.CALLOUT // Correcto para CampaignAsset
      }
    }));

    // El SDK de google-ads-api permite enviarlos todos juntos
    await customer.campaignAssets.create(campaignAssetOperations as any);

    // 5. Marcar progreso en Supabase
    await db.from('user_progress').upsert({
      user_id: userId,
      category: 'clientes',
      instance_key: 'geografia', // Este es el key para el desafío #4 según mi mapeo anterior
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, category, instance_key' });

    return NextResponse.json({ 
      success: true, 
      callouts: calloutTexts,
      message: "Textos destacados (Callouts) inyectados con éxito en la campaña."
    });

  } catch (error: any) {
    console.error("Callouts Setup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
