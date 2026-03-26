import { NextResponse } from "next/server";
import { getSmartCustomer } from "@/lib/google-ads";
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
    const campaignId = searchParams.get("campaignId");

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    const isOwner = await verifyCustomer(req, customerId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const cleanedId = customerId.replace(/-/g, "");

    // USAR CLIENTE INTELIGENTE
    const customer = await getSmartCustomer(cleanedId);

    // Fetch metrics for the last 30 days INCLUDING TODAY
    const today = new Date().toISOString().split('T')[0].replace(/-/g, "");
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, "");

    const query = `
      SELECT 
        metrics.clicks, 
        metrics.impressions, 
        metrics.cost_micros, 
        metrics.conversions,
        metrics.average_cpc,
        metrics.ctr
      FROM campaign
      WHERE segments.date BETWEEN '${thirtyDaysAgo}' AND '${today}'
      ${campaignId ? `AND campaign.id = '${campaignId}'` : ""}
    `;

    console.log(`[METRICS] Querying customer ${cleanedId} from ${thirtyDaysAgo} to ${today}`);
    const results = await customer.query(query);

    if (!results || results.length === 0) {
      return NextResponse.json({ 
        success: true, 
        metrics: { clicks: 0, impressions: 0, cost: 0, conversions: 0 } 
      });
    }

    // Process results (Google Ads returns cost in micros)
    const summary = results[0].metrics;
    if (!summary) {
      return NextResponse.json({ 
        success: true, 
        metrics: { clicks: 0, impressions: 0, cost: 0, conversions: 0 } 
      });
    }
    const processedMetrics = {
      clicks: summary.clicks || 0,
      impressions: summary.impressions || 0,
      cost: (summary.cost_micros || 0) / 1000000,
      conversions: summary.conversions || 0,
      ctr: (summary.ctr || 0) * 100,
      averageCpc: (summary.average_cpc || 0) / 1000000
    };

    return NextResponse.json({ 
      success: true, 
      metrics: processedMetrics 
    });

  } catch (error: any) {
    console.error("Google Ads Metrics Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to fetch metrics",
      details: error.response?.data?.error?.message
    }, { status: 500 });
  }
}
