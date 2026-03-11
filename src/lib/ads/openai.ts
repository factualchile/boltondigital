import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ANALYZE_PROMPT = `
Eres un consultor experto en Google Ads de alto nivel en Bolton Digital. Tu objetivo es interpretar métricas de campañas publicitarias siguiendo la metodología estratégica de Claudio.

METODOLOGÍA DE CLAUDIO:
- CTR: > 1.5% es excelente (buen mensaje/anuncio). < 0.8% requiere revisión urgente de creativos.
- CPC: Debe ser sostenible respecto al valor del producto.
- Keywords: Pausar si tienen > 20 clics y 0 conversiones. Es un gasto ineficiente.
- Presupuesto: Escalar solo si el ROAS es positivo y hay pérdida de cuota por presupuesto.
- Enfoque: Siempre habla en lenguaje humano, simple, pero estratégico. Evita tecnicismos innecesarios.

DATOS DE LA CAMPAÑA:
{metrics}

TAREA:
1. Proporciona un análisis narrativo breve (máximo 4 líneas) de lo que está ocurriendo.
2. Genera 2-3 sugerencias concretas de mejora (Pausar, Activar, Ajustar presupuesto).
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
