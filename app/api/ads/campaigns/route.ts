import { NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { verifyCustomer } from "@/lib/auth-server";

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
const MCC_ID = process.env.GOOGLE_ADS_MCC_ID!;

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

    const client = new GoogleAdsApi({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      developer_token: DEVELOPER_TOKEN,
    });

    const customerOptions: any = {
      customer_id: cleanedId,
      refresh_token: REFRESH_TOKEN,
    };
    
    // Solo incluir login_customer_id si MCC_ID está definido y no es una cadena vacía
    if (MCC_ID && MCC_ID.trim().length > 0) {
      customerOptions.login_customer_id = MCC_ID.replace(/-/g, "");
    }

    const customer = client.Customer(customerOptions);

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
