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
    
    // 1. Obtener settings si no vienen en formData
    const { data: settings } = await db
      .from('user_settings')
      .select('campaign_survey, conversion_config')
      .eq('user_id', userId)
      .single();

    let userEmail = null;

    // Buscamos el email en el sistema de Auth (Admin) para notificaciones
    if (supabaseAdmin) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      userEmail = userData?.user?.email;
    }

    if (!userEmail) userEmail = "soporte@boltondigital.cl";

    const survey = formData || settings?.campaign_survey || {};

    // IA: Solo si faltan datos descriptivos (Experience)
    let aiContent = { experience: "", specialties: [] };
    if (!survey.profession && !survey.specialties) {
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                role: "system", 
                content: "Genera biografía y especialidades para un profesional en formato JSON { 'experience': string, 'specialties': string[] }." 
                },
                { 
                role: "user", 
                content: `Profesión: ${survey.profession || survey.main_service}.` 
                }
            ],
            response_format: { type: "json_object" }
        });
        aiContent = JSON.parse(aiResponse.choices[0].message?.content || "{}");
    }

    // Construcción del objeto final para la landing respetando la estructura de Claudio
    const landingData = {
      name: survey.name || "Profesional",
      profession: survey.profession || "Especialista",
      service: survey.service || "Atención Profesional",
      location: survey.location || "Chile",
      phone: survey.phone || "+56 9 1234 5678",
      imageUrl: survey.imageUrl || "", 
      slogan: survey.slogan || "Comprometido con resultados tangibles.",
      experience: survey.profession || aiContent.experience || "Profesional dedicado con amplia trayectoria en el sector.",
      specialties: survey.specialties || aiContent.specialties || ["Atención de calidad", "Confidencialidad"],
      includeGuarantee: survey.includeGuarantee !== undefined ? survey.includeGuarantee : true,
      email: userEmail,
      conversionConfig: settings?.conversion_config || null
    };

    return NextResponse.json({ success: true, landingData });

  } catch (error: any) {
    console.error("Landing Preparation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
