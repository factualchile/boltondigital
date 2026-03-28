import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { ads } = await req.json();

    if (!ads || !Array.isArray(ads)) {
      return NextResponse.json({ error: "Ads data is required" }, { status: 400 });
    }

    const prompt = `
      Eres un copywriter experto en marketing digital. Analiza estos anuncios actuales y su CTR (visibilidad/interés):
      ${JSON.stringify(ads.map((a: any) => ({ headlines: a.headlines, ctr: a.ctr })))}

      Genera un análisis JSON:
      Para CADA anuncio (o grupo de anuncios similares):
      1. Evalúa el "tono" (ej: Muy formal, Aburrido, Directo).
      2. Da una "crítica humana" de máximo 15 palabras.
      3. Sugiere UNA "nueva variante" de título o descripción que sea más atractiva.

      Responde en JSON con este formato:
      {
        "analyses": [
          { "id": "id_del_anuncio", "tone": "...", "critique": "...", "suggestion": "..." },
          ...
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres el experto creativo de Bolton Digital." },
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
    console.error("Creative Analysis API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to analyze creatives",
    }, { status: 500 });
  }
}
