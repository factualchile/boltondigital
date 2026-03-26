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

    // CONSULTA MÍNIMA DE DESCUBRIMIENTO: Solo ID y Nombre
    // Quitamos métricas totalmente para evitar cualquier filtrado implícito de Google Ads
    const query = `
      SELECT 
        campaign.id, 
        campaign.name, 
        campaign.status 
      FROM campaign 
      WHERE campaign.status IN ('ENABLED', 'PAUSED')
    `;

    console.log(`[CAMPAIGNS] DISCOVERY MODE: Requesting from customer ${cleanedId}`);
    const results = await customer.query(query);

    if (!results || results.length === 0) {
      console.warn(`[CAMPAIGNS] No results found for ${cleanedId}. Check account type.`);
      return NextResponse.json({ success: true, campaigns: [] });
    }

    const campaigns = results.map((row: any) => ({
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status,
      // Valores por defecto para no romper el front
      clicks: 0,
      impressions: 0,
      cost: 0,
      conversions: 0,
      ctr: 0,
      averageCpc: 0
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));

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
