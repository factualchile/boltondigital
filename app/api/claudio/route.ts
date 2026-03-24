import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { canConsume, consumeTokens } from '@/lib/tokenomics';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, campaignContext, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "UserId is required for billing" }, { status: 400 });
    }

    // 1. Verificar si tiene tokens disponibles
    const hasTokens = await canConsume(userId);
    if (!hasTokens) {
      return NextResponse.json({ 
        error: "Has alcanzado tu límite mensual de 500,000 tokens. El saldo se reseteará el día 1 del próximo mes." 
      }, { status: 403 });
    }

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
    const totalTokens = response.usage?.total_tokens || 0;

    // 2. Consumir tokens en segundo plano (atómico)
    await consumeTokens(userId, totalTokens);

    return NextResponse.json({ 
      response: aiResponse,
      usage: totalTokens
    });
  } catch (error: any) {
    console.error('Error in /api/claudio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
