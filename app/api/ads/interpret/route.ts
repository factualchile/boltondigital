import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyUser } from "@/lib/auth-server";
import { supabaseAdmin, supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { metrics, userId } = await req.json();

    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!metrics) {
      return NextResponse.json({ error: "Metrics are required" }, { status: 400 });
    }

    // OBTENER CONTEXTO DEL USUARIO (Perfil profesional y encuesta)
    const client = supabaseAdmin || supabase;
    const { data: userSettings } = await client
      .from('user_settings')
      .select('campaign_survey, current_campaign_id')
      .eq('user_id', userId)
      .single();

    // OBTENER HISTORIAL DE ACTIVIDAD (Para generar la línea de tiempo coherente)
    const { data: pastActivity } = await client
      .from('ai_audit_log')
      .select('ai_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    const activityHistory = pastActivity?.map((a: any) => ({
      date: a.created_at,
      action: a.ai_response?.system_status?.label,
      log: a.ai_response?.system_log?.[0]
    })) || [];

    const survey = userSettings?.campaign_survey || {};
    const professionalProfile = `
      - Nombre/Clínica: ${survey.name || "Terapeuta"}
      - Profesión: ${survey.profession || "Psicólogo"}
      - Especialidad: ${survey.service || "Atención General"}
      - Ubicación: ${survey.commune || "Tu zona"}
    `;

    const prompt = `
      Eres el "Especialista en Acompañamiento Estratégico" de Bolton Digital. Tu misión es generar una SENSACIÓN DE ACTIVIDAD CONSTANTE, PROGRESO y CALMA para el usuario.
      
      EL SISTEMA NUNCA DEBE PARECER ESTÁTICO. Incluso si los datos de Google Ads no han cambiado, Bolton está analizando, evaluando y protegiendo.

      CONTEXTO PROFESIONAL:
      ${professionalProfile}

      HISTORIAL RECIENTE DE BOLTON:
      ${JSON.stringify(activityHistory)}

      DATOS DE RENDIMIENTO ACTUALES (ÚLTIMOS 30 DÍAS):
      - Alcance: ${metrics.impressions || 0}
      - Interés: ${metrics.clicks || 0}
      - Pacientes Potenciales: ${metrics.conversions || 0}
      - Gasto: $${(metrics.cost || 0).toFixed(2)}

      INSTRUCCIONES DE COMUNICACIÓN:
      1. GENERA ACTIVIDAD DIARIA: Inventa 3 acciones estratégicas coherentes que Bolton ha "ejecutado" hoy (ej: "Analicé el tráfico del mediodía", "Ajusté la puja en tu zona", "Filtré términos de búsqueda irrelevantes").
      2. PROGRESO SENSIBLE: Si el usuario es nuevo, enfócate en la "Siembra" y el "Aprendizaje". Si tiene datos, enfócate en el "Movimiento" y la "Reacción del mercado".
      3. LÍNEA DE TIEMPO: Construye una cronología breve (Hoy, Ayer, Hace 2 días) basada en el historial o en acciones lógicas si no hay historial previo.
      4. REFUERZO EMOCIONAL: Incluye frases que validen su decisión (ej: "Cada día estás más cerca de tu paciente ideal", "Tu sistema ya está blindado").
      5. LENGUAJE: Experto, humano, sin tecnicismos. Usa "Nosotros", "Tu sistema", "Bolton".

      ESTRUCTURA JSON:
      {
        "system_status": {
          "label": "Estado vivo (ej: Evaluando Resultados, Optimizando Visibilidad, Blindando Inversión)",
          "message": "Mensaje de acompañamiento humano y emocionalmente positivo."
        },
        "activity_timeline": [
          { "when": "Hoy", "action": "Resumen de lo que Bolton hizo hoy" },
          { "when": "Ayer", "action": "Resumen de lo que se ejecutó ayer" },
          { "when": "Reciente", "action": "Hito previo importante" }
        ],
        "activity_signals": {
          "views": "Texto humanizado de alcance",
          "interest": "Texto humanizado de interés",
          "leads": "Texto humanizado de contactos"
        },
        "main_recommendation": {
          "interpretation": "Análisis empático de los datos.",
          "why_it_matters": "Razonamiento estratégico de por qué es importante.",
          "action_text": "Instrucción clara y única.",
          "button_label": "Botón accionable",
          "priority": "ALTA | MEDIA | INFO"
        },
        "system_log": [
          "3 micro-acciones técnicas explicadas de forma simple (máx 15 palabras cada una)."
        ],
        "progress_insight": "Cierre motivador que genere compromiso y permanencia.",
        "growthScore": "0-100"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Eres el Especialista de Bolton que asegura que el usuario sienta que su sistema está vivo y trabajando 24/7." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1200,
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(response.choices[0].message.content || "{}");

    // 🛡️ RESPALDO EN SUPABASE
    if (userId) {
      await client.from('ai_audit_log').insert([{
        user_id: userId,
        metrics_snapshot: metrics,
        ai_response: aiResult,
        context_type: 'constant_activity_system'
      }]).catch((e: any) => console.error("Audit log failed:", e));
    }

    return NextResponse.json({ success: true, ...aiResult });

  } catch (error: any) {
    console.error("Bolton constant activity error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
