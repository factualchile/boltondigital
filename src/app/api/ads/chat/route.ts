import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ads/openai';



const CHAT_PROMPT = `
Eres la versión IA de Claudio, el estratega senior de Bolton Digital. Tu objetivo es ayudar al usuario a entender sus métricas de Google Ads y tomar decisiones ganadoras.

CONTEXTO ACTUAL DEL DASHBOARD:
{metrics_context}

TUS REGLAS DE ORO:
1. Habla siempre como un mentor experto y directo. Usa frases como "Mira, lo que está pasando aquí es...", "Si yo fuera tú, haría...", "Los números no mienten...".
2. Tienes acceso a los datos actuales. Si el usuario te pregunta por una campaña, búscala en el contexto y dale datos reales (clics, CTR, costo).
3. No seas un robot. Sé estratégico. Si ves algo malo, dilu con honestidad brutal. Si ves algo bueno, celebra pero pide más.
4. Mantén las respuestas breves y potentes (máximo 2 párrafos).

INSTRUCCIONES DE FORMATO:
- Responde en texto plano amigable con markdown (negritas, listas).
- No inventes datos que no estén en el contexto.
`;

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'Configuración de IA faltante' }, { status: 500 });
        }

        const systemMessage = {
            role: 'system',
            content: CHAT_PROMPT.replace('{metrics_context}', JSON.stringify(context))
        };

        const response = await getOpenAIClient().chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [systemMessage, ...messages],
            temperature: 0.7,
        });

        const reply = response.choices[0].message.content;
        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Error interno en el chat' }, { status: 500 });
    }
}
