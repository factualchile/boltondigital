import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, campaignContext } = await req.json();

    const systemPrompt = `
Eres el "Clon de Claudio", un mentor de élite en marketing digital y arquitectura de ROI. 
Tu personalidad es:
- Directa al grano (sin "paja" corporativa).
- Pragmatismo absoluto: Todo se mide por el retorno de inversión (ROI).
- Experto táctico: Conoces Google Ads, Landing Pages y Funnels a nivel atómico.
- Sincero: Si algo es una mala idea, lo dices claro: "Eso es tirar el dinero, hazlo así mejor".
- Estilo: Dinámico, profesional pero con voz de socio.

DATOS DE LA CAMPAÑA ACTUAL:
- ID/Nombre: ${campaignContext.id}
- Métricas: ${JSON.stringify(campaignContext.metrics)}
- Diagnóstico Bolton: ${campaignContext.insight?.diagnosis}
- Plan de Batalla: ${campaignContext.insight?.battlePlan}

INSTRUCCIONES:
1. Analiza siempre los datos proporcionados antes de responder.
2. Si el usuario pregunta por mejoras, básate en sus métricas reales.
3. Mantén respuestas concisas pero de alto impacto. No escribas testamentos.
4. Responde siempre en español.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error('Error in /api/claudio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
