import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { ads, learnings, campaignName, userId } = await req.json();

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!ads || !Array.isArray(ads)) {
      return NextResponse.json({ error: "Ads data is required" }, { status: 400 });
    }

    const topAds = ads.sort((a, b) => b.ctr - a.ctr).slice(0, 2);

    const prompt = `
      Eres un redactor publicitario senior (Copywriter). Tu misión es generar 2 NUEVAS VARIANTES de anuncios de alto impacto para la campaña "${campaignName}".
      
      CONTEXTO DE ÉXITO (Lo que ya funciona):
      ${JSON.stringify(topAds.map(a => ({ headlines: a.headlines, descriptions: a.descriptions })))}
      
      APRENDIZAJES SISTÉMICOS (Reglas de oro):
      ${JSON.stringify(learnings || [])}

      REGLAS DE GENERACIÓN:
      1. Mantén la coherencia con el éxito previo pero aporta un nuevo "ángulo" emocional.
      2. Máximo 30 caracteres por título.
      3. Máximo 90 caracteres por descripción.
      
      Responde en JSON con este formato:
      {
        "variants": [
          { "headline": "...", "description": "...", "angle": "Emocional / Directo / Escasez" },
          ...
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres el copywriter experto de Bolton Digital." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error: any) {
    console.error("Creative Variants API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
