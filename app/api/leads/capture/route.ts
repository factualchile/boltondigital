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
    const contentType = req.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const payload = formData.get("payload") as string;
      body = JSON.parse(payload);
    } else {
      // Manejar 'text/plain' u otros
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch (e) {
        // Si no es JSON, intentar parsear como query string (fallback extremo)
        const params = new URLSearchParams(text);
        if (params.has("payload")) {
            body = JSON.parse(params.get("payload") as string);
        } else {
            throw new Error("Formato de cuerpo no soportado");
        }
      }
    }

    const { when, schedule, name, phone, userEmail } = body;

    if (!name || !phone || !userEmail) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400, headers: corsHeaders });
    }

    const db = supabaseAdmin || supabase;

    // 1. Guardar el lead en la tabla 'leads' (Estado inicial: procesando)
    const { data: insertedRows, error: insertError } = await db
      .from('leads')
      .insert([
        { 
          professional_email: userEmail,
          lead_name: name,
          lead_phone: phone,
          preferred_time: schedule ? `${when} (${schedule})` : when,
          status: 'procesando_notificacion',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    const insertedLead = insertedRows?.[0];

    if (insertError) {
      console.error("Error guardando lead en DB:", insertError);
      return NextResponse.json({ error: "Fallo al guardar en DB", details: insertError }, { status: 500, headers: corsHeaders });
    }

    // 2. Enviar Correo con Resend (Usando Dominio Verificado)
    try {
      console.log("Enviando notificación oficial desde boltondigital.cl...");
      let { data: resendData, error: resendError } = await resend.emails.send({
        from: 'Bolton Digital <leads@boltondigital.cl>', // Usamos el dominio verificado
        to: [userEmail],
        bcc: ['contactoboltondigital@gmail.com'], // Mantenemos copia para el administrador
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
          </div>
        `
      });

      // Si el envío al usuario falla (posiblemente por no estar verificado en Resend), enviar al admin como fallback
      if (resendError) {
        console.warn("Fallo envío directo, activando Fallback al administrador...");
        const fallbackRes = await resend.emails.send({
          from: 'Bolton Digital <onboarding@resend.dev>',
          to: ['contactoboltondigital@gmail.com'],
          subject: `⚠️ [Resumen Bolton] Nuevo Lead para ${userEmail}: ${name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Aviso de Fallback: Notificación de Lead 🚀</h2>
              <p>Resend bloqueó el envío directo a <strong>${userEmail}</strong> (posiblemente falta verificar el dominio).</p>
              <hr />
              <p><strong>Lead:</strong> ${name}</p>
              <p><strong>Teléfono:</strong> ${phone}</p>
              <p><strong>Preferencia:</strong> ${when} (${schedule})</p>
            </div>
          `
        });
        
        if (fallbackRes.error) {
           console.error("Fallo crítico: El fallback también falló.");
           if (insertedLead?.id) {
               await db.from('leads').update({ status: `error_final: ${JSON.stringify(fallbackRes.error)}` }).eq('id', insertedLead.id);
           }
        } else {
           if (insertedLead?.id) {
               await db.from('leads').update({ status: 'notificado_vía_admin_fallback' }).eq('id', insertedLead.id);
           }
        }
      } else {
        // ÉXITO: El usuario ya está verificado o el dominio lo está
        if (insertedLead?.id) {
            await db.from('leads').update({ status: 'notificado' }).eq('id', insertedLead.id);
        }
      }

      // 3. Éxito total: Actualizar estado en DB
      if (insertedLead?.id) {
          await db.from('leads').update({ status: 'notificado' }).eq('id', insertedLead.id);
      }

    } catch (mailError: any) {
      console.error("Error crítico enviando email:", mailError);
      if (insertedLead?.id) {
          await db.from('leads').update({ status: `excepcion_email: ${mailError.message}` }).eq('id', insertedLead.id);
      }
      return NextResponse.json({ error: "Excepción en el envío de correo" }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: "Lead capturado y notificado con éxito" }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("Lead Capture Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
