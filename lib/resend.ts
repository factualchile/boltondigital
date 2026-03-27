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

export async function sendLeadNotification(to: string, lead: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Bolton Digital <onboarding@resend.dev>",
      to: [to],
      subject: `NUEVO LEAD: ${lead.name}`,
      html: `
        <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: white; border-radius: 20px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 50px; height: 50px; background: #3b82f6; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                <span style="color: white; font-size: 24px; font-weight: 900;">B</span>
            </div>
            <h2 style="color: #1e4b6b; margin: 0;">¡Nuevo Interesado Recibido! 🚀</h2>
            <p style="color: #64748b; font-size: 14px;">Bolton ha capturado una nueva oportunidad de negocio.</p>
          </div>

          <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #f1f5f9;">
            <p style="margin: 0 0 10px; font-size: 13px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">Detalles del Lead</p>
            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${lead.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${lead.email}</p>
            <p style="margin: 5px 0;"><strong>Origen:</strong> ${lead.source_campaign || 'Orgánico / Landing'}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 15px; line-height: 1.6;">Este interesado proviene de tu nueva Landing Page Profesional. Te recomendamos contactarlo en los primeros 15 minutos para aumentar la tasa de cierre en un 70%.</p>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Bolton Digital © 2026 — Inteligencia de Crecimiento</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Internal Lead Notification Error:", err);
    return { success: false, error: err };
  }
}

export async function sendChallengeCompletionEmail(to: string, challengeName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Bolton Digital <onboarding@boltondigital.cl>",
      to: [to],
      subject: `¡Felicidades! Desafío Superado: ${challengeName} 🏆`,
      html: `
        <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="background: #0f172a; padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0; color: white; margin: -20px -20px 30px -20px;">
            <div style="width: 80px; height: 80px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(59, 130, 246, 0.3);">
                <span style="font-size: 40px;">🏆</span>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; line-height: 1.2;">¡Hito Estratégico Alcanzado!</h1>
            <p style="opacity: 0.7; font-size: 16px; margin-top: 10px;">Tu infraestructura digital se vuelve más robusta.</p>
          </div>

          <div style="padding: 10px 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">¡Excelente trabajo!</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Acabas de completar el desafío estratégico: <br/>
              <strong style="color: #3b82f6; font-size: 20px;">${challengeName}</strong>
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; margin-bottom: 30px; position: relative;">
              <span style="position: absolute; top: -10px; left: 20px; background: #3b82f6; color: white; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">Estado Bolton OS</span>
              <p style="margin: 0; font-size: 15px; color: #475569; font-weight: 500;">
                "Cada desafío completado calibra mejor mi visión estratégica sobre tu negocio. Estamos más cerca de dominar tu mercado local."
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #94a3b8; font-weight: 700;">— Claudio, Agente IA Maestro</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://boltondigital.cl/dashboard" style="display: inline-block; background: #0f172a; color: white; padding: 1.2rem 2.5rem; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; transition: all 0.3s;">Continuar la Misión 🚀</a>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
          <div style="text-align: center; color: #94a3b8; font-size: 11px;">
            <p style="margin: 0;">Bolton Digital © 2026 — Inteligencia de Crecimiento Aplicada</p>
            <p style="margin: 5px 0;">Recibes este correo porque completaste un hito clave en tu configuración.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error (Challenge):", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Internal Challenge Notification Error:", err);
    return { success: false, error: err };
  }
}

export async function sendActionNotification(to: string, actionName: string, details: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Bolton Digital <onboarding@boltondigital.cl>",
      to: [to],
      subject: `Bolton Ejecutó: ${actionName} ⚡️`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; color: #0f172a; border-radius: 20px; border: 1px solid #e2e8f0;">
          <h2 style="color: #3b82f6;">Confirmación de Acción Bolton</h2>
          <p style="font-size: 16px; line-height: 1.6;">Hola, siguiendo tu instrucción, Bolton ha ejecutado la siguiente acción estratégica en tu cuenta:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin: 20px 0;">
             <p style="margin: 0; font-weight: bold; font-size: 18px;">${actionName}</p>
             <p style="margin: 10px 0 0; color: #64748b;">${details}</p>
          </div>

          <p style="font-size: 14px; color: #475569;">Este cambio ya está reflejado en tu panel de Google Ads.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Bolton Digital © 2026 — Inteligencia de Crecimiento</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error (Action):", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Internal Action Notification Error:", err);
    return { success: false, error: err };
  }
}
