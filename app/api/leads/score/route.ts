import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { leads, attribution, userId } = await req.json();

    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json({ error: "Leads data is required" }, { status: 400 });
    }

    const prompt = `
      Eres un Director Comercial Senior en Bolton Digital. Tu misión es calificar y priorizar estos prospectos (leads) para que Claudio sepa a quién llamar primero.
      
      DATOS DE LOS PROSPECTOS:
      Leads: ${JSON.stringify(leads.map((l: any) => ({ id: l.id, name: l.name, email: l.email, source: l.source_campaign })))}
      Contexto de Atribución (Eficiencia de Campaña): ${JSON.stringify(attribution)}

      REGLAS DE CALIFICACIÓN (0-100):
      1. Dale +20 puntos si el canal de origen tiene un "efficiencyScore" alto.
      2. Dale +15 puntos si el email parece profesional o corporativo.
      3. Asigna un "Trait" (ej: "Alta Prioridad", "VIP", "Curioso", "Frío") que resuma su potencial.
      
      FORMATO JSON OBLIGATORIO:
      {
        "scores": [
          { 
            "id": "id_del_lead", 
            "score": number, 
            "trait": "Calificación corta" 
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres el analista de calidad de Bolton Digital." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error: any) {
    console.error("Lead Scoring API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to score leads",
    }, { status: 500 });
  }
}
