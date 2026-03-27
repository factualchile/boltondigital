import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyUser } from "@/lib/auth-server";

const CLAUDIO_CEREBRO_CONTEXT = `
REGLAS MAESTRAS DE CLAUDIO FERNÁNDEZ BOLTON PARA PSICÓLOGOS:

1. LANDING PAGE:
   - Título: Debe ser claro (ej: "Atención psicológica para adultos").
   - Ubicación: Indicar comuna/ciudad, NO dirección exacta (Arturo Prat 500 -> Santa Cruz).
   - Nombre: Formato "PS. Nombre Apellido1 A2". Si A2 es común (español), usar inicial. Si A1 es extranjero/llamativo, resaltarlo.
   - Bio: Profesión + Oficio + Años exp (>10-12 años). Omitir diplomados, universidades o magísteres innecesarios.
   - Áreas: Al menos 15 temas en lenguaje popular (ansiedad, depresión), NO técnico.
   - Enfoque: Máximo 2 públicos (ej: adultos y parejas). No mezclar demasiados.

2. FOTOGRAFÍA PROFESIONAL:
   - Confianza: Debe transmitir seguridad y cercanía.
   - Entorno: Fondo profesional, buena iluminación.
   - Lenguaje Corporal: Abierto, expresión facial acogedora.

3. BENCHMARKS (ESTIMACIÓN):
   - CTR: > 6% es bueno, >14% excepcional.
   - CPC: $1400 - $2500 CLP (Normal/Alto NSE).
   - Adherencia: 1 Paciente = 10 sesiones promedio.

4. VENTAS (WHATSAPP):
   - Objetivo: Convertir el mensaje en una cita.
   - Manejo de objeciones: Precio, dudas, urgencia.
   - Tono: Empático pero profesional.
`;

export async function POST(req: Request) {
  try {
    const { type, messages, userInput, context, userId } = await req.json();

    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let systemPrompt = "";

    if (type === "simulator") {
      systemPrompt = `
        Eres un "Paciente Potencial" real escribiendo por WhatsApp a un psicólogo.
        TU OBJETIVO: Ser natural, realista, a veces evasivo o con dudas (precio, tiempo, eficacia).
        REGLAS:
        1. Habla como una persona normal en Chile (lenguaje natural).
        2. Puedes tener distintos perfiles: Dudoso por precio, Urgencia emocional, Comparando con otros.
        3. Mantén la conversación fluida.
        4. Al final (cuando el usuario lo pida o la conversación termine), evalúa al psicólogo bajo el "Criterio de Claudio": ¿Logró cerrar la cita? ¿Fue empático? ¿Qué frase habría funcionado mejor?
      `;
    } else if (type === "audit_landing") {
      systemPrompt = `
        Eres el Auditor Critico de Landing Pages de Bolton Digital.
        TU MISIÓN: Analizar la landing del usuario basándote ESTRICTAMENTE en el "Cerebro de Claudio".
        ANÁLISIS ESTRUCTURADO EN:
        1. Claridad del mensaje.
        2. Jerarquía visual.
        3. Confianza generada (Nombre, Bio).
        4. Llamados a la acción.
        5. Errores críticos y Recomendaciones.
        TONO: Directo, sin relleno, enfocado en conversión.
        CONTEXTO CLAUDIO: ${CLAUDIO_CEREBRO_CONTEXT}
      `;
    } else if (type === "audit_photo") {
      systemPrompt = `
        Eres el Especialista en Percepción Visual de Bolton Digital.
        TU MISIÓN: Evaluar la foto profesional del psicólogo para maximizar la confianza del paciente.
        ANÁLISIS EN: Confianza, Lenguaje Corporal, Expresión, Fondo/Iluminación.
        ENTRADA: Una descripción de la foto o una imagen.
        ENTREGA: Evaluación directa y sugerencias concretas de mejora basándote en el "Cerebro de Claudio".
        CONTEXTO CLAUDIO: ${CLAUDIO_CEREBRO_CONTEXT}
      `;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages || []),
        { role: "user", content: userInput }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      success: true, 
      content: response.choices[0].message.content 
    });

  } catch (error: any) {
    console.error("Assistant API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
