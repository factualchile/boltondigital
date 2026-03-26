import { NextResponse } from "next/server";
import { getSmartCustomer } from "@/lib/google-ads";
import { verifyCustomer } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    const isOwner = await verifyCustomer(req, customerId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const cleanedId = customerId.replace(/-/g, "");

    // USAR CLIENTE INTELIGENTE (MCC/Standalone Rescate)
    const customer = await getSmartCustomer(cleanedId);

    // CONSULTA ULTRA-SIMPLIFICADA: Traemos todas (habilitadas o pausadas)
    // No filtramos por métricas en la query para que SIEMPRE aparezcan.
    const query = `
      SELECT 
        campaign.id,
        campaign.name, 
        campaign.status,
        metrics.clicks, 
        metrics.impressions, 
        metrics.cost_micros, 
        metrics.conversions
      FROM campaign
      WHERE campaign.status IN ('ENABLED', 'PAUSED')
    `;

    console.log(`[CAMPAIGNS] LISTADO BRUTO: Querying customer ${cleanedId}`);
    const results = await customer.query(query);

    const campaigns = (results || []).map((row: any) => ({
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status,
      // Métricas por si acaso (podrían venir null si no hay datos)
      clicks: row.metrics?.clicks || 0,
      impressions: row.metrics?.impressions || 0,
      cost: (row.metrics?.cost_micros || 0) / 1000000,
      conversions: row.metrics?.conversions || 0,
      ctr: (row.metrics?.ctr || 0) * 100,
      averageCpc: (row.metrics?.average_cpc || 0) / 1000000
    })).sort((a: any, b: any) => b.cost - a.cost);

    return NextResponse.json({ 
      success: true, 
      campaigns 
    });

  } catch (error: any) {
    console.error("Google Ads Campaigns Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to fetch campaigns",
      details: error.response?.data?.error?.message
    }, { status: 500 });
  }
}
