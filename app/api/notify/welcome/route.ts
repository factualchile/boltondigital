import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json({ error: "Email y UserId son requeridos" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      throw new Error("Supabase Admin client not initialized");
    }

    // 1. Marcar Atómicamente (Solo el primero que lo logre envía el correo)
    // Intentamos actualizar una fila existente donde welcome_sent sea false.
    // Si la fila no existe (primer ingreso), la insertamos directamente.
    
    // NOTA: Usamos UPDATE primero para el caso más común de reintentos rápidos
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('user_tokens')
      .update({ welcome_sent: true })
      .eq('user_id', userId)
      .eq('welcome_sent', false)
      .select();

    if (updateError) throw updateError;

    // Si data tiene longitud, significa que nosotros cambiamos de false a true.
    let shouldSend = (updateData && updateData.length > 0);

    if (!shouldSend) {
      // Si no hubo update, puede ser que el registro no existe aún.
      // Intentamos insertarlo. Si falla por duplicidad de llave, es que alguien ya lo hizo.
      const { error: insertError } = await supabaseAdmin
        .from('user_tokens')
        .insert({ user_id: userId, welcome_sent: true });

      if (!insertError) {
        shouldSend = true; // Inserción exitosa. DEBEMOS enviar.
      } else if (insertError.code === '23505') {
        // Violación de unicidad. Ya estaba allí (posiblemente como true o alguien nos ganó).
        return NextResponse.json({ success: true, message: "Correo ya gestionado anteriormente" });
      } else {
        throw insertError;
      }
    }

    if (!shouldSend) {
      return NextResponse.json({ success: true, message: "Correo omitido (ya en proceso o enviado)" });
    }

    // 2. Enviar Correo de Bienvenida y Verificación
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'Bolton Digital <onboarding@boltondigital.cl>',
      to: [email],
      bcc: ['contactoboltondigital@gmail.com'],
      replyTo: 'soporte@boltondigital.cl',
      subject: '🚀 ¡Bienvenido a Bolton Digital! Tu cuenta ha sido verificada',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
          <div style="background: #0f172a; padding: 3rem; text-align: center; color: white;">
            <div style="display: inline-flex; padding: 1rem; border-radius: 50%; background: rgba(59, 130, 246, 0.1); margin-bottom: 1.5rem;">
               <span style="font-size: 40px;">🛡️</span>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">¡Cuenta Verificada con Éxito!</h1>
            <p style="opacity: 0.8; font-size: 16px; margin-top: 0.5rem;">Bienvenido a la nueva era del ROI inteligente.</p>
          </div>
          
          <div style="padding: 3rem; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 18px; margin-bottom: 1.5rem;">Hola,</p>
            <p style="font-size: 16px; margin-bottom: 1.5rem;">
              Es un placer saludarte. Tu cuenta en <strong>Bolton Digital</strong> ha sido verificada correctamente y ya tienes acceso total a todas nuestras herramientas de élite.
            </p>
            <p style="font-size: 16px; margin-bottom: 2rem;">
              Estamos aquí para impulsarte en cada paso de tu estrategia digital. Deseamos que alcances el máximo potencial utilizando nuestra plataforma para escalar tus resultados.
            </p>

            <div style="background: #f8fafc; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2.5rem;">
              <h3 style="margin: 0 0 1rem 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Gestión de Recursos (Tokenomics)</h3>
              <p style="margin: 0; font-size: 15px; color: #334155;">
                Como parte de tu plan actual, dispones de una cuota de <strong>500,000 tokens mensuales</strong> para utilizar en todas nuestras funciones de Inteligencia Artificial (Clon de Claudio, Laboratorio, Asistentes).
              </p>
              <p style="margin: 1rem 0 0 0; font-size: 13px; color: #94a3b8; font-style: italic;">
                *Esta cuota se reinicia automáticamente el día 1 de cada mes.
              </p>
            </div>

            <div style="text-align: center;">
              <a href="https://boltondigital.cl/dashboard" style="display: inline-block; background: #3b82f6; color: white; padding: 1.2rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);">Acceder a mi Dashboard</a>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 2rem; text-align: center; color: #64748b; font-size: 14px;">
            <p style="margin: 0;">© 2026 Bolton Digital. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    });

    if (resendError) {
      console.error("Error enviando bienvenida con Resend:", resendError);
      return NextResponse.json({ error: "Error en el envío del correo" }, { status: 500 });
    }

    // El marcado ya se hizo preventivamente al inicio del flujo para evitar colisiones

    return NextResponse.json({ success: true, message: "Correo de bienvenida enviado con éxito" });

  } catch (error: any) {
    console.error("Welcome Notification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
