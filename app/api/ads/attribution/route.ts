import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { leads, campaigns } = await req.json();

    if (!leads || !campaigns) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }

    // Calculamos algunas métricas básicas para ayudar a la IA
    const attributionData = campaigns.map((c: any) => {
      const leadCount = leads.filter((l: any) => l.source_campaign === c.name || l.campaign_id === c.id).length;
      return {
        name: c.name,
        cost: c.cost,
        leads: leadCount,
        cpl: leadCount > 0 ? c.cost / leadCount : c.cost
      };
    });

    const prompt = `
      Eres un analista de marketing senior. Analiza esta relación entre Inversión y Contactos Generados:
      ${JSON.stringify(attributionData)}

      Genera un análisis breve (máximo 40 palabras) tipo "Sabiduría de Atribución".
      REGLAS:
      1. Usa lenguaje 100% humano (sin promedios complejos).
      2. Sé directo: "La campaña X es tu mayor imán de clientes" o "Estás pagando mucho por contactos en Y".
      3. Sugiere dónde poner más dinero hoy.

      Responde en JSON:
      {
        "wisdom": "...",
        "bestCampaign": "...",
        "efficiencyScore": 95 // Escala 0-100
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres el estratega proactivo de Bolton Digital." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error: any) {
    console.error("Attribution Wisdom API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate attribution wisdom",
    }, { status: 500 });
  }
}
