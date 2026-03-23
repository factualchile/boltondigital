import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { campaigns, overallMetrics, userId } = await req.json();

    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!campaigns || !Array.isArray(campaigns)) {
      return NextResponse.json({ error: "Campaign data is required" }, { status: 400 });
    }

    const prompt = `
      Eres un Senior Ads Strategy Engineer en Bolton Digital. Tu misión es analizar el rendimiento de la campaña y dar 3 recomendaciones tácticas de ALTO IMPACTO.
      
      CONTEXTO DE DATOS:
      Campañas: ${JSON.stringify(campaigns.map((c: any) => ({ name: c.name, cost: c.cost, conversions: c.conversions, ctr: c.ctr, average_cpc: c.average_cpc })))}
      Métricas Consolidadas: ${JSON.stringify(overallMetrics)}

      REGLAS DE ORO:
      1. Sé proactivo y directo (ej: "Sube presupuesto", "Pausa este anuncio", "Cambia el título").
      2. No uses jerga técnica aburrida, usa lenguaje de negocio ("Ahorrarás", "Atraerás más gente").
      3. Cada recomendación debe ser única y basada en los números.
      
      CATEGORÍAS DE TIPO:
      - AHORRO: Para reducir costos innecesarios.
      - CRECIMIENTO: Para escalar lo que funciona.
      - OPTIMIZACIÓN: Para mejorar la calidad técnica (CTR, conversiones).

      FORMATO JSON OBLIGATORIO:
      {
        "recommendations": [
          { 
            "title": "Título corto y potente", 
            "description": "Explicación clara del por qué", 
            "impact": "Beneficio tangible", 
            "type": "AHORRO" | "CRECIMIENTO" | "OPTIMIZACION" 
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Eres el estratega proactivo de Bolton Digital." },
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
    console.error("Recommendations API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate recommendations",
    }, { status: 500 });
  }
}
