import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { metrics, campaigns } = await req.json();

    if (!metrics) {
      return NextResponse.json({ error: "Metrics are required" }, { status: 400 });
    }

    // Lógica de simulación (Estimaciones conservadoras)
    const currentCPA = metrics.conversions > 0 ? metrics.cost / metrics.conversions : metrics.cost / 1;
    const currentCTR = metrics.ctr;

    const scenarios = [
      {
        id: 'optimization',
        title: 'Optimización de Mensaje',
        description: 'Si aplicamos la nueva voz de marca y mejoramos tu interés (CTR) un 10%.',
        impactLabel: 'Clientes potenciales extra',
        impactValue: Math.round(metrics.conversions * 0.15) || 2,
        requirement: 'Ajustar textos de anuncios',
        type: 'STABLE'
      },
      {
        id: 'efficiency',
        title: 'Reinversión Inteligente',
        description: 'Si movemos el presupuesto de las campañas en ROJO hacia las GANADORAS.',
        impactLabel: 'Ahorro proyectado',
        impactValue: `$${(metrics.cost * 0.2).toFixed(2)}`,
        requirement: 'Pausar campañas "Alerta"',
        type: 'SUCCESS'
      },
      {
        id: 'scale',
        title: 'Escalar Ganadores',
        description: 'Si aumentamos un 20% el presupuesto solo en tus campañas estrella.',
        impactLabel: 'Nuevos clientes estimados',
        impactValue: Math.round((metrics.conversions * 1.2) - metrics.conversions) || 3,
        requirement: '+$20 / semanal',
        type: 'PRIMARY'
      }
    ];

    return NextResponse.json({ 
      success: true, 
      scenarios
    });

  } catch (error: any) {
    console.error("Forecasting API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate forecast",
    }, { status: 500 });
  }
}
