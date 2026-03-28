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

    // OBTENER HISTORIAL DE ACTIVIDAD REAL (Para generar la línea de tiempo basada en hechos)
    const { data: realActivity } = await client
      .from('user_activity_log')
      .select('action_type, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    const factHistory = realActivity?.map((a: any) => ({
      date: a.created_at,
      action: a.action_type,
      detail: a.description
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

      BITÁCORA TÉCNICA REAL (HECHOS):
      ${JSON.stringify(factHistory)}

      DATOS DE RENDIMIENTO ACTUALES (ÚLTIMOS 30 DÍAS):
      - Alcance (Impresiones): ${metrics.impressions || 0}
      - Interés (Clicks): ${metrics.clicks || 0}
      - Pacientes Potenciales (Conversiones): ${metrics.conversions || 0}
      - Gasto Real: $${(metrics.cost || 0).toFixed(0)} CLP

      INSTRUCCIONES DE COMUNICACIÓN Y ANÁLISIS:
      1. ANÁLISIS CLAUDIO: Evalúa el CTR y las conversiones según las reglas de Claudio.
      2. PROYECCIÓN FINANCIERA: Calcula el "Ingreso Proyectado" basado en 10 sesiones por cada Paciente Potencial y el precio de sesión del usuario ($${survey.price || 30000}).
      3. HISTORIAL REAL: Resume la BITÁCORA TÉCNICA en hasta 10 instancias temporales (Hoy, Ayer, Martes, Lunes, Esta semana, Semana pasada, etc.). Agrupa eventos del mismo día en un párrafo breve de 2 líneas que explique el sentido estratégico.
      4. REFUERZO EMOCIONAL: Tono experto, humano, empático (Psicólogo-Empresa). Usa "Nosotros", "Tu sistema", "Bolton".

      ESTRUCTURA JSON OBLIGATORIA (PROHIBIDO EL LENGUAJE GENÉRICO):
      {
        "system_status": {
          "label": "Diagnóstico Técnico (ej: CTR 12% (Fantástico), Alerta: 0 Conversiones en 7 días, Campaña Limitada por Puja)",
          "message": "Mensaje directo y métrico al estilo Claudio."
        },
        "claudio_roi": {
          "projected_revenue": "Monto total proyectado",
          "adherence_logic": "Explicación breve de 10 sesiones.",
          "status": "RENTABLE | EN CRECIMIENTO | EVALUANDO"
        },
        "activity_timeline": [
          { "when": "Hoy", "action": "Resumen estratégico de lo que realmente se hizo hoy" },
          { "when": "Ayer", "action": "Resumen estratégico de ayer" }
        ],
        "activity_signals": {
          "views": "Alcance real (Impresiones)",
          "interest": "Personas interesadas (Clicks)",
          "leads": "Potenciales pacientes (Conversiones)"
        },
        "main_recommendation": {
          "interpretation": "Análisis clínico de Claudio sobre tu campaña.",
          "why_it_matters": "Razonamiento estratégico.",
          "action_text": "Instrucción clara.",
          "button_label": "Botón accionable",
          "priority": "ALTA | MEDIA | INFO"
        },
        "system_log": [
          "3 micro-acciones técnicas reales extraídas del historial bruto."
        ],
        "progress_insight": "Mensaje final directo al estilo Claudio.",
        "growthScore": "0-100"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "ERES EL CLON ESTRATÉGICO DE CLAUDIO FERNÁNDEZ BOLTON. PROHIBIDO EL LENGUAJE POÉTICO O GENÉRICO. HABLA SIEMPRE CON MÉTRICAS Y DIAGNÓSTICOS TÉCNICOS BASADOS EN HECHOS REALES." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    let aiResult;
    try {
      const content = response.choices[0].message.content || "{}";
      aiResult = JSON.parse(content);
    } catch (e) {
      console.error("[Bolton IA] Error parseando respuesta:", e);
      aiResult = {};
    }

    // 🛡️ GARANTÍA DE ESQUEMA (Si la IA falla o devuelve algo incompleto, inyectamos el diagnóstico determinista)
    if (!aiResult.system_status || !aiResult.system_status.label) {
       aiResult.system_status = {
          label: "Calibrando Visión Estratégica",
          message: "Bolton está analizando tu motor. Por ahora, guíate por el diagnóstico técnico del panel inferior mientras sincronizamos tu visión de largo plazo."
       };
    }

    // 🛡️ RESPALDO EN SUPABASE Y BITÁCORA TÉCNICA
    if (userId) {
      const db = supabaseAdmin || supabase;
      
      // 1. Log para auditoría IA (Detallado)
      try {
        await db.from('ai_audit_log').insert([{
          user_id: userId,
          metrics_snapshot: metrics,
          ai_response: aiResult,
          context_type: 'constant_activity_system'
        }]);
      } catch (e: any) {
        console.error("Audit log failed:", e);
      }

      // 2. Log para Historial Real (Resumen Técnico)
      try {
        await db.from('user_activity_log').insert([{
            user_id: userId,
            action_type: 'AI_STRATEGY_AUDIT',
            description: `Análisis de Visión: ${aiResult.system_status.label}`,
            meta_data: { status: aiResult.system_status.label, score: aiResult.growthScore }
        }]);
      } catch (e: any) {
        console.error("Activity log failed:", e);
      }
    }

    return NextResponse.json({ success: true, ...aiResult });

  } catch (error: any) {
    console.error("Bolton constant activity error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
