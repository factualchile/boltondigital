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

    // Desglose por campaña en los últimos 30 días (Incluyendo hoy)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, "");
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, "");

    const query = `
      SELECT 
        campaign.id,
        campaign.name, 
        campaign.status,
        metrics.clicks, 
        metrics.impressions, 
        metrics.cost_micros, 
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.status != 'REMOVED'
    `;

    console.log(`[CAMPAIGNS] Querying customer ${cleanedId} from ${thirtyDaysAgo} to ${today}`);
    const results = await customer.query(query);

    const campaigns = results.map((row: any) => ({
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status,
      clicks: row.metrics.clicks || 0,
      impressions: row.metrics.impressions || 0,
      cost: (row.metrics.cost_micros || 0) / 1000000,
      conversions: row.metrics.conversions || 0,
      ctr: (row.metrics.ctr || 0) * 100,
      averageCpc: (row.metrics.average_cpc || 0) / 1000000
    })).sort((a: any, b: any) => b.cost - a.cost); // Ordenar por mayor gasto primero

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
