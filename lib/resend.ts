import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInsightEmail(to: string, insight: any, metrics: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Bolton Digital <onboarding@resend.dev>", // Cambiar a dominio real en producción
      to: [to],
      subject: `Tu Reporte Humano: ${insight.statusLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #050505; color: #ffffff;">
          <h1 style="color: #3b82f6;">Hola,</h1>
          <p style="font-size: 18px; line-height: 1.6;">${insight.diagnosis}</p>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 10px; margin: 30px 0;">
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">PRÓXIMA ACCIÓN</p>
            <p style="margin: 10px 0 0; font-size: 20px; font-weight: bold;">${insight.nextAction}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="padding: 15px; border: 1px solid #334155; border-radius: 8px;">
              <p style="margin:0; color: #94a3b8; font-size: 12px;">Personas</p>
              <p style="margin:5px 0 0; font-size: 18px; font-weight: bold;">${metrics.clicks}</p>
            </div>
            <div style="padding: 15px; border: 1px solid #334155; border-radius: 8px;">
              <p style="margin:0; color: #94a3b8; font-size: 12px;">Puntaje de Crecimiento</p>
              <p style="margin:5px 0 0; font-size: 18px; font-weight: bold; color: #3b82f6;">${insight.growthScore}</p>
            </div>
          </div>

          <p style="margin-top: 40px; color: #64748b; font-size: 12px; text-align: center;">
            Bolton Digital © 2026 — Inteligencia aplicada a tu crecimiento.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Internal Notification Error:", err);
    return { success: false, error: err };
  }
}
