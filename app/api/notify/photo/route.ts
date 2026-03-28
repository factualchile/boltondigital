import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { verifyUser } from "@/lib/auth-server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { imageUrl, userId } = await req.json();

    if (!imageUrl) return NextResponse.json({ error: "Image URL is required" }, { status: 400 });

    let userEmail = "soporte@boltondigital.cl";
    let userName = "Profesional";

    // 1. Obtener email del usuario si hay userId disponible
    if (userId && supabaseAdmin) {
       const isOwner = await verifyUser(req, userId);
       if (isOwner) {
         const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
         userEmail = userData?.user?.email || userEmail;
         userName = userData?.user?.user_metadata?.full_name || "Colega";
       }
    }

    // 2. Enviar Correo con la Foto
    const { data, error } = await resend.emails.send({
      from: 'Bolton AI <asistentes@boltondigital.cl>',
      to: [userEmail],
      bcc: ['contactoboltondigital@gmail.com'],
      subject: '📸 Tu Nuevo Retrato de Autoridad - Bolton Digital',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="background: #0f172a; padding: 3rem; text-align: center; color: white;">
            <div style="display: inline-flex; padding: 1rem; border-radius: 50%; background: rgba(59, 130, 246, 0.1); margin-bottom: 1.5rem;">
               <span style="font-size: 32px;">✨</span>
            </div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -1px;">Retrato de Autoridad Bolton</h1>
            <p style="opacity: 0.8; font-size: 15px; margin-top: 0.5rem;">La primera impresión es la que cierra la cita.</p>
          </div>
          
          <div style="padding: 3rem; color: #1e293b; line-height: 1.6; text-align: center;">
            <p style="font-size: 18px; margin-bottom: 1.5rem; color: #0f172a; font-weight: 700;">¡Hola ${userName}!</p>
            <p style="font-size: 16px; margin-bottom: 2rem; color: #64748b;">
              Tu asistente de imagen ha terminado el proceso de mejora. Aquí tienes tu nuevo retrato optimizado para proyectar **máxima confianza y profesionalismo** en tu Landing Page y redes sociales.
            </p>

            <div style="margin: 2.5rem 0; padding: 10px; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1;">
                <img src="${imageUrl}" alt="Tu Retrato Bolton" style="width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);" />
            </div>

            <div style="background: #fffbeb; padding: 1.5rem; border-radius: 12px; border: 1px solid #fde68a; margin-bottom: 2.5rem; text-align: left;">
              <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 700;">💡 El Consejo de Claudio:</p>
              <p style="margin: 0.5rem 0 0 0; font-size: 14px; color: #b45309; line-height: 1.5;">
                "Una foto donde pareces un experto no es vanidad, es estrategia. Si el paciente siente que eres la autoridad que busca, el precio deja de ser una objeción."
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${imageUrl}" download="mi-foto-bolton.jpg" style="display: inline-block; background: #3b82f6; color: white; padding: 1rem 2rem; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">Descargar Imagen HD</a>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 2rem; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">Enviado automáticamente por el Asistente de Imagen de Bolton Digital.</p>
            <p style="margin: 0.5rem 0 0 0;">© 2026 Bolton Digital. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Foto enviada con éxito" });

  } catch (error: any) {
    console.error("Email Photo Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
