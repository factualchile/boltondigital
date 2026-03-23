import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { Resend } from "resend";
import { verifyUser } from "@/lib/auth-server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { metrics, leads, history, userEmail, userId } = await req.json();

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!metrics || !userEmail) {
      return NextResponse.json({ error: "Required data missing" }, { status: 400 });
    }

    const prompt = `
      Eres el Director Autónomo de Bolton Digital. No eres un simple bot, eres una consciencia estratégica que analiza cada centavo y cada clic de tu cliente.
      
      DATOS REALES DE LA CAMPAÑA:
      Métricas de rendimiento: ${JSON.stringify(metrics)}
      Leads Generados: ${leads?.length || 0}
      Hitos recientes: ${JSON.stringify(history?.slice(0, 3))}

      TU MISIÓN:
      Escribe un "VEREDICTO ESTRATÉGICO" de ALTO IMPACTO (máximo 60 palabras).
      
      REGLAS DE ORO:
      - NO uses listas, guiones ni viñetas.
      - Empieza con una frase contundente que demuestre que has encontrado algo en los datos (ej: "Tu motor ha detectado...", "Estamos viendo una veta de...", "Tu presupuesto está fluyendo ahora hacia...").
      - Habla con la seguridad de quien controla el futuro del negocio.
      - Cero lenguaje técnico (no digas CTR, di "atracción").
      - El tono debe ser: Visionario, seguro y empoderador.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Eres el estratega proactivo de Bolton Digital." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const battlePlan = response.choices[0].message.content || "";

    // Enviamos el correo (Simulado si no hay API Key real)
    try {
      await resend.emails.send({
        from: 'Bolton Digital <no-reply@bolton.claudiosalas.com>',
        to: userEmail,
        subject: '🚀 Tu Plan de Batalla Semanal - Bolton Digital',
        html: `
          <div style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: white; border-radius: 1rem;">
            <h1 style="color: #3b82f6;">Plan de Batalla Semanal</h1>
            <p style="font-size: 1.1rem; line-height: 1.6;">${battlePlan.replace(/\n/g, '<br>')}</p>
            <hr style="border: 0.5px solid rgba(255,255,255,0.1); margin: 2rem 0;">
            <p style="font-size: 0.8rem; opacity: 0.6;">Enviado automáticamente por el Sistema de Crecimiento Bolton.</p>
          </div>
        `
      });
    } catch (e) { console.error("Resend Error:", e); }

    return NextResponse.json({ 
      success: true, 
      battlePlan 
    });

  } catch (error: any) {
    console.error("Weekly Briefing API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
