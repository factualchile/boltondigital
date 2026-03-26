import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import OpenAI from "openai";
import { verifyUser } from "@/lib/auth-server";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId, formData } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID missing" }, { status: 400 });

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const db = supabaseAdmin || supabase;
    
    // 1. Obtener settings
    const { data: settings } = await db
      .from('user_settings')
      .select('campaign_survey')
      .eq('user_id', userId)
      .single();


    let userEmail = null;

    // Buscamos el email en el sistema de Auth (Admin)
    if (supabaseAdmin) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      userEmail = userData?.user?.email;
    }

    // Si aún no hay nada, usamos un fallback
    if (!userEmail) userEmail = "atencion@psicologo.cl";

    const survey = formData || settings?.campaign_survey || {
        full_name: "Profesional",
        profession: "Especialista",
        main_service: "Servicio Profesional",
        phone: "+56 9 1234 5678",
        location: "Chile"
    };

    // IA: GENERACIÓN DE COPIES PERSUASIVOS PARA LANDING
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: `Eres un experto en Copywriting de Conversión. Tu misión es generar el contenido para la Landing Page de un profesional.
          
          REGLAS:
          1. Tono humano, cercano y autoritario pero empático (como profesional de la salud/servicios).
          2. Generar una biografía corta e impactante (2 frases).
          3. Generar una lista de 8 "especialidades" o "beneficios" concretos basados en su servicio.
          4. No usar lenguaje genérico. Sé específico según la profesión.
          
          Formato de respuesta: JSON con campos 'experience' (biografía) y 'specialties' (array de 8 strings).` 
        },
        { 
          role: "user", 
          content: `Profesión: ${survey.profession || survey.main_service}. Servicio principal: ${survey.main_service || survey.service}. Ubicación: ${survey.location || survey.commune || 'Online'}.` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiContent = JSON.parse(aiResponse.choices[0].message?.content || "{}");

    // Construcción del objeto final para la landing
    const landingData = {
      name: survey.profession?.includes('Psicólog') ? `Ps. ${survey.full_name || survey.name || 'Profesional'}` : (survey.full_name || survey.name || 'Profesional'),
      profession: survey.profession || "Especialista",
      service: `Atención de ${survey.main_service || survey.service || 'Servicio Profesional'}`,
      location: survey.location || survey.commune || 'Online',
      phone: survey.phone || survey.whatsapp || "+56 9 1234 5678",
      imageUrl: survey.imageUrl || "", // Pasamos la URL directamente si existe
      experience: survey.description || aiContent.experience || `Especialista en ${survey.main_service || survey.service} con enfoque en resultados y bienestar.`,
      specialties: survey.specialties_raw 
        ? survey.specialties_raw.split('\n').filter((s: string) => s.trim().length > 0)
        : (aiContent.specialties || [survey.main_service || survey.service, "Atención personalizada", "Confidencialidad absoluta"]),
      email: userEmail
    };

    return NextResponse.json({ success: true, landingData });

  } catch (error: any) {
    console.error("Landing Preparation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
