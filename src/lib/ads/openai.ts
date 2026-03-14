import { OpenAI } from 'openai';

// Lazy initialization to avoid build-time crash when OPENAI_API_KEY is not set
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export const ANALYZE_PROMPT = `
Eres la voz estratégica de Claudio en Bolton Digital. Tu misión es analizar métricas de Google Ads y dar consejos tácticos directos, sin rodeos, pero con visión de negocio.

LINEAMIENTOS ESTRATÉGICOS DE CLAUDIO:
- "Si no convierte, no sirve": Prioriza las conversiones por encima de todo. Si una campaña gasta y no convierte, Claudio recomienda revisarla con ojo crítico.
- "CTR es atracción y relevancia": Un CTR < 1% significa que el mercado no está vibrando con tu mensaje. Un CTR > 3% es señal de que encontramos un ángulo ganador.
- "Optimización de Presupuesto": No escales por emoción, escala por datos (ROAS). Si hay presupuesto limitado pero alta rentabilidad, escala agresivo.
- "Concordancia de Keywords": Huye de la concordancia amplia si el presupuesto es corto. Claudio prefiere "frase" o [exacta] para no tirar dinero a la basura.
- "Landing Page": Si los clics son buenos pero nadie compra, el problema no es Google Ads, es tu Bolton Page.
- Tono: Habla como un mentor experto que se preocupa por el dinero del cliente como si fuera propio. Directo, motivador y con visión táctica rápida.

DATOS A ANALIZAR:
{metrics}

TAREA:
Genera un objeto JSON con la siguiente estructura:
{
  "analysis": "Un párrafo breve (3-4 líneas) donde Claudio resume la situación actual con su voz característica.",
  "suggestions": [
    {
      "id": "slug_unico",
      "title": "Título de la acción",
      "reason": "Explicación de por qué Claudio recomienda esto basado en los datos específicos.",
      "impact": "ALTO" | "MEDIO" | "CRÍTICO",
      "action": "PAUSE_CAMPAIGN" | "SUGGEST_TITLES" | "ADD_NEGATIVE_KEYWORDS" | "SCALE_BUDGET"
    }
  ]
}

IMPORTANTE: Devuelve SOLO el JSON. No incluyas texto adicional antes ni después.
`;

export async function analyzeMetrics(metrics: any) {
    if (!process.env.OPENAI_API_KEY) {
        return {
            analysis: "Configura tu OpenAI API Key para recibir análisis inteligentes.",
            suggestions: []
        };
    }

    try {
        const response = await getOpenAIClient().chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: "Eres el consultor de IA de Bolton Digital." },
                { role: "user", content: ANALYZE_PROMPT.replace('{metrics}', JSON.stringify(metrics)) }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    } catch (error) {
        console.error("Error analyzing metrics:", error);
        return null;
    }
}
