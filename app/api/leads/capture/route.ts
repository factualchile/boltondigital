import { NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PATCH, DELETE",
  "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { when, schedule, name, phone, userEmail } = body;

    if (!name || !phone || !userEmail) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400, headers: corsHeaders });
    }

    const db = supabaseAdmin || supabase;

    // 1. Guardar el lead en la tabla 'leads'
    const { error: insertError } = await db
      .from('leads')
      .insert([
        { 
          professional_email: userEmail,
          lead_name: name,
          lead_phone: phone,
          preferred_time: schedule ? `${when} (${schedule})` : when,
          status: 'nuevo',
          created_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error("Error guardando lead en DB:", insertError);
    }

    // 2. Enviar Correo con Resend
    try {
      const { data: resendData, error: resendError } = await resend.emails.send({
        from: 'Bolton Digital <onboarding@resend.dev>', // Usamos onboarding para asegurar entrega rápida
        to: userEmail,
        replyTo: 'soporte@boltondigital.cl',
        subject: `🚀 Nuevo Lead: ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 2rem; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">¡Nuevo Lead Capturado! 🎉</h1>
              <p style="opacity: 0.8;">Bolton IA ha generado un nuevo contacto desde tu landing.</p>
            </div>
            <div style="padding: 2rem; background: #ffffff;">
              <p style="font-size: 16px; color: #475569; margin-bottom: 2rem;">Tienes un nuevo prospecto interesado en tus servicios:</p>
              
              <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <p style="margin: 0.5rem 0;"><strong>Nombre:</strong> ${name}</p>
                <p style="margin: 0.5rem 0;"><strong>Teléfono:</strong> <a href="tel:${phone}" style="color: #2c6a91;">${phone}</a></p>
                <p style="margin: 0.5rem 0;"><strong>Preferencia:</strong> ${when}</p>
                ${schedule ? `<p style="margin: 0.5rem 0;"><strong>Horario útil:</strong> ${schedule}</p>` : ''}
              </div>

              <div style="text-align: center;">
                <a href="https://wa.me/${phone.replace(/\D/g, '')}" style="display: inline-block; background: #2c6a91; color: white; padding: 1rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 16px;">Contactar ahora por WhatsApp</a>
              </div>
            </div>
            <div style="background: #f1f5f9; padding: 1.5rem; text-align: center; font-size: 12px; color: #94a3b8;">
              <p>© ${new Date().getFullYear()} Bolton Digital. Este lead fue capturado automáticamente desde una cuenta de prueba de Resend.</p>
            </div>
          </div>
        `
      });

      if (resendError) {
        console.error("Resend API Error details:", resendError);
        // Si hay error de Resend, lo devolvemos para debugear (solo en esta fase)
        return NextResponse.json({ 
            success: false, 
            error: "Fallo en Resend", 
            details: resendError 
        }, { status: 500, headers: corsHeaders });
      }

    } catch (mailError: any) {
      console.error("Error crítico enviando email:", mailError);
      return NextResponse.json({ error: "Excepción en el envío de correo" }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: "Lead capturado y notificado con éxito" }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("Lead Capture Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
