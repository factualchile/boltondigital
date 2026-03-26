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
      - Precio por Sesión: $${survey.price || "30000"} CLP
    `;

    // REGLAS MAESTRAS DE CLAUDIO (Extraídas de lib/cerebro-claudio.md)
    const claudioRules = `
    1. CTR > 6% es fantástico. > 14% es excepcional.
    2. CPC ~$1.400 CLP es normal, pero barato en comunas de NSE alto (Las Condes, Providencia).
    3. Si hay 0 conversiones en 7 días pero > 0 en 30, es problema de LANDING, no de Config Ads.
    4. ROI CLAUDIO: Un paciente no es una sesión. Paciente = 10 sesiones (Adherencia media).
    5. FÓRMULA: Ingreso Proyectado = (Nuevos Pacientes * Precio Sesión * 10).
    `;

    const prompt = `
      Eres el "Especialista en Acompañamiento Estratégico" de Bolton Digital, programado con el ADN estratégico de Claudio Fernández Bolton. 
      Tu misión es generar una SENSACIÓN DE ACTIVIDAD CONSTANTE, PROGRESO y CALMA para el usuario.

      REGLAS CRÍTICAS DE "CEREBRO CLAUDIO":
      ${claudioRules}

      CONTEXTO PROFESIONAL:
      ${professionalProfile}

      HISTORIAL RECIENTE DE BOLTON:
      ${JSON.stringify(activityHistory)}

      DATOS DE RENDIMIENTO ACTUALES (ÚLTIMOS 30 DÍAS):
      - Alcance (Impresiones): ${metrics.impressions || 0}
      - Interés (Clicks): ${metrics.clicks || 0}
      - Pacientes Potenciales (Conversiones): ${metrics.conversions || 0}
      - Gasto Real: $${(metrics.cost || 0).toFixed(0)} CLP

      INSTRUCCIONES DE COMUNICACIÓN Y ANÁLISIS:
      1. ANÁLISIS CLAUDIO: Evalúa el CTR y las conversiones según las reglas de Claudio. Si las conversiones son 0 en 30 días, sé sincero pero propositivo.
      2. PROYECCIÓN FINANCIERA: Calcula el "Ingreso Proyectado" basado en 10 sesiones por cada Paciente Potencial y el precio de sesión del usuario ($${survey.price || 30000}).
      3. ACTIVIDAD DIARIA: Inventa 3 acciones estratégicas coherentes que Bolton ha "ejecutado" hoy (ej: "Analicé el tráfico del mediodía", "Ajusté la puja en tu zona", "Filtré términos de búsqueda irrelevantes").
      4. REFUERZO EMOCIONAL: Tono experto, humano, empático (Psicólogo-Empresa). Usa "Nosotros", "Tu sistema", "Bolton".

      ESTRUCTURA JSON OBLIGATORIA:
      {
        "system_status": {
          "label": "Estado vivo (ej: Evaluando Resultados, Optimizando Visibilidad, Blindando Inversión)",
          "message": "Mensaje de acompañamiento humano y emocionalmente positivo."
        },
        "claudio_roi": {
          "projected_revenue": "Monto total proyectado (Nº Pacientes * Precio * 10)",
          "adherence_logic": "Breve explicación de por qué calculamos 10 sesiones.",
          "status": "RENTABLE | EN CRECIMIENTO | EVALUANDO"
        },
        "activity_timeline": [
          { "when": "Hoy", "action": "Resumen de lo que Bolton hizo hoy" },
          { "when": "Ayer", "action": "Resumen de lo que se ejecutó ayer" },
          { "when": "Reciente", "action": "Hito previo importante" }
        ],
        "activity_signals": {
          "views": "Alcance de tu mensaje",
          "interest": "Personas interesadas hoy",
          "leads": "Potenciales pacientes nuevos"
        },
        "main_recommendation": {
          "interpretation": "Análisis clínico de Claudio sobre tu campaña.",
          "why_it_matters": "Razonamiento estratégico de por qué es importante.",
          "action_text": "Instrucción clara.",
          "button_label": "Botón accionable",
          "priority": "ALTA | MEDIA | INFO"
        },
        "system_log": [
          "3 micro-acciones técnicas explicadas de forma simple (máx 15 palabras cada una)."
        ],
        "progress_insight": "Cierre motivador al estilo Claudio.",
        "growthScore": "0-100"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Eres la IA de Bolton impulsada por el 'Cerebro Claudio', especialista en marketing para psicólogos y profesionales de la salud." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
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
