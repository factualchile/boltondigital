import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { url, campaignName } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // En una versión real, usaríamos un scraper o la API de PageSpeed.
    // Aquí usamos OpenAI para simular el análisis experto basado en el contexto.
    const prompt = `
      Eres un experto en optimización de conversión (CRO). Analiza esta URL de destino para la campaña "${campaignName}":
      URL: ${url}

      Genera un diagnóstico de conversión JSON:
      1. Evalúa la "Coherencia de Mensaje" (ej: Ads ofrece terapia, ¿la web también?).
      2. Evalúa la "Claridad del CTA" (Llamado a la acción).
      3. Da un consejo crítico de máximo 20 palabras.
      4. Asigna un "Puntaje de Destino" (0-100).

      Responde en JSON con este formato:
      {
        "score": 75,
        "coherence": "Alta / Media / Baja",
        "critique": "...",
        "ctaCheck": "Válido / Débil",
        "nextImprovement": "Sugerencia rápida..."
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres el consultor de conversiones de Bolton Digital." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error: any) {
    console.error("Landing Audit API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
