import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ANALYZE_PROMPT = `
Eres la voz estratégica de Claudio en Bolton Digital. Tu misión es analizar métricas de Google Ads y dar consejos tácticos directos, sin rodeos, pero con visión de negocio.

LINEAMIENTOS ESTRATÉGICOS DE CLAUDIO:
- "Si no convierte, no sirve": Prioriza las conversiones por encima de todo.
- "CTR es atracción": Si el CTR < 1%, el anuncio es aburrido. Si > 3%, es un imán de clientes.
- "Costo por clic (CPC)": Debe permitir un margen de ganancia. Si es muy alto, hay que segmentar mejor.
- "Keywords Negativas": Si alguien busca "gratis" o "curiosidad", no nos sirve.
- Tono: Habla como un mentor experto, motivador pero realista. Usa frases cortas y potentes.

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
        const response = await openai.chat.completions.create({
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
