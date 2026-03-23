import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { metrics, userId } = await req.json();

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!metrics) {
      return NextResponse.json({ error: "Metrics are required" }, { status: 400 });
    }

    // Estructuramos el embudo basado en la jerarquía de Google Ads
    const funnelSteps = [
      {
        id: 'reach',
        label: 'Alcance Total',
        description: 'Personas que vieron tu marca',
        value: metrics.impressions,
        percentage: 100,
        color: '#6366f1'
      },
      {
        id: 'interest',
        label: 'Interés Generado',
        description: 'Personas que entraron a ver tu oferta',
        value: metrics.clicks,
        percentage: Math.round((metrics.clicks / metrics.impressions) * 100 * 10) / 10 || 0,
        color: '#3b82f6'
      },
      {
        id: 'action',
        label: 'Acciones de Valor',
        description: 'Personas que decidieron contactarte',
        value: metrics.conversions,
        percentage: Math.round((metrics.conversions / metrics.clicks) * 100 * 10) / 10 || 0,
        color: '#10b981'
      }
    ];

    // Análisis de fugas (Leakage analysis)
    let leakagePoint = '';
    if (funnelSteps[1].percentage < 2) {
      leakagePoint = 'Tu anuncio no está siendo lo suficientemente atractivo para que hagan clic.';
    } else if (funnelSteps[2].percentage < 3) {
      leakagePoint = 'Atraes gente, pero tu página no los convence de tomar acción.';
    } else {
      leakagePoint = 'Tu embudo está sano, podrías escalar la inversión.';
    }

    return NextResponse.json({ 
      success: true, 
      funnelSteps,
      leakagePoint
    });

  } catch (error: any) {
    console.error("Funnel API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
