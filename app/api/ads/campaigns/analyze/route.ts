import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { campaigns } = await req.json();

    if (!campaigns || !Array.isArray(campaigns)) {
      return NextResponse.json({ error: "Campaign list is required" }, { status: 400 });
    }

    const prompt = `
      Eres un experto en auditoría de marketing digital. Analiza esta lista de campañas de los últimos 30 días:
      ${JSON.stringify(campaigns)}

      Para CADA campaña, asígnale:
      1. Un "tag": [GANADORA, ALERTA, ESTABLE, SUBOPTIMA].
      2. Una "reason": Una frase de máximo 10 palabras que explique por qué tiene ese tag (sin tecnicismos).

      Asigna GANADORA a las que tengan muchas conversiones o mejor eficiencia.
      Asigna ALERTA a las que tengan mucho costo y CERO o pocas conversiones.
      Asigna SUBOPTIMA a las que tengan buen alcance (impresiones) pero pocas visitas (clics).

      Responde en JSON con este formato:
      {
        "analyses": [
          { "id": "id_de_campaña", "tag": "TAG", "reason": "razón humana" },
          ...
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Eres el auditor inteligente de Bolton Digital." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error: any) {
    console.error("Campaign Analysis Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to analyze campaigns",
    }, { status: 500 });
  }
}
