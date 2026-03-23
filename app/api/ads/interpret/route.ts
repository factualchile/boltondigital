import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { metrics, userId } = await req.json();

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!metrics) {
      return NextResponse.json({ error: "Metrics are required" }, { status: 400 });
    }

    const prompt = `
      Eres un experto en crecimiento de negocios digitales con un tono humano, claro y directo.
      Analiza los siguientes datos de Google Ads de los últimos 30 días de un profesional:
      - Clics: ${metrics.clicks || 0}
      - Impresiones: ${metrics.impressions || 0}
      - Inversión: $${(metrics.cost || 0).toFixed(2)}
      - Conversiones: ${metrics.conversions || 0}
      - CTR: ${(metrics.ctr || 0).toFixed(2)}%
      - CPC Promedio: $${(metrics.averageCpc || 0).toFixed(2)}

      Genera una respuesta en formato JSON con la siguiente estructura:
      {
        "diagnosis": "Un diagnóstico de NO MÁS de 2 oraciones cortas sin lenguaje técnico.",
        "growthScore": "Un número de 0 a 100 basado en el desempeño (considerando costo/conve y volumen).",
        "nextAction": "La acción principal que debemos tomar mañana en lenguaje simple.",
        "statusLabel": "Una etiqueta corta de estado (ej: Óptimo, Creciendo, Estable, Alerta)"
      }

      REGLAS:
      - NO uses lenguaje técnico en "diagnosis" o "nextAction".
      - Habla de "personas" y "visitas".
      - El tono debe ser: "Esto ya está trabajando por mí y entiendo mi negocio".
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Eres el cerebro inteligente de Bolton Digital." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error: any) {
    console.error("OpenAI Interpretation Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate interpretation",
    }, { status: 500 });
  }
}
