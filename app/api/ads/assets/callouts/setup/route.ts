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
    const landingUrl = settings.landing_url;
    const customer = await getSmartCustomer(settings.google_ads_id);

    // 2. IA: Generar los Callouts
    if (!await canConsume(userId)) {
       throw new Error("Saldo de Tokens insuficiente. Bolton está en pausa estratégica.");
    }

    const prompt = `Como experto estratega en Google Ads, analiza este perfil profesional y genera 4 Textos Destacados (Callouts) ganadores. 
    REGLAS:
    - Máximo 25 caracteres por cada uno.
    - Deben generar autoridad y confianza.
    - Ejemplo: "Más de 10 años de Exp.", "Atención en 24h", "Resultados Comprobados".

    Perfil:
    Profesión: ${survey.profession}
    Servicios: ${survey.specialties}
    Página: ${landingUrl}

    Responde ÚNICAMENTE con un JSON con el formato: { "callouts": ["...", "...", "...", "..."] }`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    // Auditoría de Tokens
    const totalTokens = aiResponse.usage?.total_tokens || 500;
    await consumeTokens(userId, totalTokens);

    const aiResult = JSON.parse(aiResponse.choices[0].message?.content || "{}");
    const calloutTexts: string[] = aiResult.callouts || [];

    if (calloutTexts.length === 0) throw new Error("La IA no pudo generar los textos destacados.");

    // 3. Crear los Assets en Google Ads
    const assetResourceNames: string[] = [];
    const timestamp = Date.now();
    
    for (const text of calloutTexts) {
      const trimmedText = text.substring(0, 25); // Safe guard
      try {
        const assetResponse = await customer.assets.create([{
          callout_asset: {
            callout_text: trimmedText
          },
          type: enums.AssetType.CALLOUT,
          // Añadimos timestamp para evitar colisión de nombres si el usuario reintenta
          name: `Bolton Callout ${timestamp}: ${trimmedText}`.substring(0, 80)
        } as any]);

        if (assetResponse.results && assetResponse.results[0]) {
          assetResourceNames.push((assetResponse.results[0] as any).resource_name);
        }
      } catch (assetErr: any) {
        console.warn(`[Callouts] Error creando asset para "${trimmedText}":`, assetErr.message);
        // Si falla un asset (ej: por duplicado de texto), intentamos seguir con los demás
      }
    }

    if (assetResourceNames.length === 0) {
      throw new Error("No se pudo crear ninguno de los textos destacados en Google Ads.");
    }

    // 4. Vincular Assets a la Campaña
    const campaignResourceName = `customers/${settings.google_ads_id.replace(/-/g, "")}/campaigns/${campaignId}`;
    
    // El SDK de google-ads-api envuelve automáticamente en 'create' cuando se usa el método .create()
    const campaignAssetOperations = assetResourceNames.map(assetName => ({
      campaign: campaignResourceName,
      asset: assetName,
      field_type: enums.AssetFieldType.CALLOUT // Usamos snake_case (gRPC style)
    }));

    try {
      console.log(`[Callouts] Vinculando ${assetResourceNames.length} assets a la campaña ${campaignId}`);
      await customer.campaignAssets.create(campaignAssetOperations as any);
    } catch (linkErr: any) {
      console.error("[Callouts] Error vinculando assets a campaña:", linkErr);
      if (!linkErr.message?.includes("ALREADY_EXISTS")) {
          throw new Error(`Error en vinculación: ${linkErr.message || JSON.stringify(linkErr)}`);
      }
    }

    // 5. Marcar progreso en Supabase
    await db.from('user_progress').upsert({
      user_id: userId,
      category: 'clientes',
      instance_key: 'geografia', 
      is_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, category, instance_key' });

    return NextResponse.json({ 
      success: true, 
      callouts: calloutTexts,
      message: "Textos destacados (Callouts) inyectados con éxito en la campaña."
    });

  } catch (error: any) {
    console.error("Callouts Setup Detailed Error:", error);
    let finalMsg = error.message;

    // Extracción de error detallado de Google Ads
    if (error.errors && Array.isArray(error.errors)) {
      finalMsg = `${error.message}: ${error.errors[0]?.message} (${error.errors[0]?.location?.field_path_elements?.map((e:any) => e.field_name).join('.')})`;
    }

    return NextResponse.json({ 
        success: false,
        error: finalMsg || "Error desconocido al configurar los textos destacados." 
    }, { status: 500 });
  }
}
