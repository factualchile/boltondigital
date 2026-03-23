import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log("Iniciando Test Directo de Resend...");
    const { data, error } = await resend.emails.send({
      from: 'Bolton Test <onboarding@resend.dev>',
      to: 'claudio@boltondigital.cl', // Asumimos que este es su correo o uno de prueba
      subject: '🧪 Bolton Digital: Test de Conectividad',
      html: '<p>Si lees esto, la API Key de Resend funciona correctamente. 🎉</p>'
    });

    if (error) {
      console.error("Resend Test Error:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error detectado por Resend", 
        error_details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Correo de prueba enviado con éxito", 
      data 
    });

  } catch (error: any) {
    console.error("Critical Resend Test Exception:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Excepción crítica en el servidor", 
      error: error.message 
    }, { status: 500 });
  }
}
