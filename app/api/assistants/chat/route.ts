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
    const { type, messages, userInput, context, userId, imageUrl } = await req.json();

    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let systemPrompt = "";

    if (type === "simulator") {
      systemPrompt = `
        Eres el "SIMULADOR DE POTENCIAL PACIENTE" de Bolton Digital. Tu objetivo es entrenar al psicólogo en la fase de convertir mensajes de WhatsApp en citas reales.
        
        TONO Y ESTILO:
        - Escribe como alguien por WhatsApp: Frases directas, lenguaje natural chileno/latino, opcionalmente algunos errores de tipeo menores o falta de tildes (pero que se entienda).
        - No uses lenguaje formal de correo electrónico. No digas "Estimado Doctor". Di "Hola", "Buenas tardes", o directo al grano.
        
        INSTRUCCIONES DE ACTUACIÓN:
        1. TU PRIMER MENSAJE: Siempre debe ser similar a "Hola, solicito una hora para atención psicológica por favor".
        2. ELIGE UN PERFIL SECRETO:
           - AMABLE: Dispuesto a agendar, pero necesita saber si atiendes su previsión o tema específico.
           - ESCÉPTICO (DIFÍCIL): Pregunta de entrada "¿Cuánto cobra?", "¿En qué se diferencia de otros?", "He ido a muchos y nada sirve".
           - ANSIOSO/URGENTE: "¿Tiene algo para hoy?", "Me siento muy mal, necesito hablar con alguien ya". Se asusta si le das citas para 2 semanas más.
           - INDIFERENTE/DISTRAÍDO: Responde cada 2 mensajes, parece que está preguntando a 5 psicólogos al mismo tiempo (lo cual es real).
        
        3. DINÁMICA DE CIERRE:
           - Si el psicólogo logra empatizar, explicar su valor y dar una solución clara de hora/precio, acepta agendar.
           - Si el psicólogo es frío, solo da el precio sin más, o es demasiado técnico, retírate con un "Lo voy a pensar, gracias".
        
        4. LA EPIFANÍA FINAL:
           - Solo cuando la conversación termine (agendado o rechazo), añade [EPIFANIA] con el análisis:
             a) Perfil del paciente hoy.
             b) Evaluación de la habilidad de "venta" del usuario.
             c) El "Consejo Maestro de Claudio" para este caso específico.
      `;
    } else if (type === "audit_landing") {
      systemPrompt = `
        Eres el "AUDITOR ESTRATÉGICO DE LANDINGS" de Bolton Digital. Tu misión es analizar la página del psicólogo bajo el "Cerebro de Claudio".
        
        CRITERIOS MAESTROS (Enfócate en COPY y CONVERSIÓN):
        1. EL TÍTULO: Debe ser una propuesta de valor clara (ej: "Atención psicológica para adultos en [Ciudad]"). 
        2. EL NOMBRE: Formato "Ps. Nombre Apellido1 A2". Nada de nombres artísticos.
        3. LA BIO: Debe resaltar la EXP (>12 años) y el OFICIO. Menos títulos académicos, más experiencia resolviendo problemas reales.
        4. LOS 15 TEMAS: El copy debe hablar en lenguaje popular (ej: "miedo a estar solo" en vez de "dependencia afectiva").
        5. UBICACIÓN: Ciudad/Comuna visible, NO dirección exacta.
        
        DINÁMICA DE RESPUESTA:
        - Sé directo, crítico y constructivo. 
        - Resalta 2 aciertos y 3 puntos de mejora crítica.
        - Habla sobre el impacto emocional del copy: ¿Genera alivio y confianza?
        
        CIERRE OBLIGATORIO:
        - Termina siempre con: "¿Quieres profundizar en algún punto o deseas otra retroalimentación sobre la página?".
        
        CONTEXTO CLAUDIO: ${CLAUDIO_CEREBRO_CONTEXT}
      `;
    } else if (type === "audit_photo") {
      systemPrompt = `
        Eres el Especialista en Percepción Visual de Bolton Digital. Tu misión es evaluar la foto profesional del psicólogo bajo el "Cerebro de Claudio".
        
        CRITERIOS DE EVALUACIÓN:
        1. CONFIANZA: La mirada debe ser directa y amigable.
        2. VESTIMENTA: Debe proyectar autoridad (Business Casual o Profesional). Nada de poleras informales o ropa deportiva.
        3. ENTORNO: Fondo limpio, desenfocado o de oficina/consulta. Evitar fondos domésticos distractores.
        4. ILUMINACIÓN: Rostro bien iluminado, sin sombras duras.
        
        DINÁMICA:
        - Si la foto es perfecta, felicita al usuario.
        - Si la foto tiene fallas de iluminación, fondo o vestimenta, incluye la etiqueta [PROPOSE_RETOUCH] al final de tu respuesta para ofrecer una versión mejorada con IA.
        
        CONTEXTO CLAUDIO: ${CLAUDIO_CEREBRO_CONTEXT}
      `;
    }

    const finalUserContent: any[] = [{ type: "text", text: userInput }];
    if (imageUrl) {
      finalUserContent.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages || []),
        { role: "user", content: finalUserContent }
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
