import { NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";

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

    const cleanedId = customerId.replace(/-/g, "");

    const client = new GoogleAdsApi({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      developer_token: DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: cleanedId,
      refresh_token: REFRESH_TOKEN,
      login_customer_id: MCC_ID,
    });

    // Fetch metrics for the last 30 days
    // We group by day or just get total for the period
    const query = `
      SELECT 
        metrics.clicks, 
        metrics.impressions, 
        metrics.cost_micros, 
        metrics.conversions,
        metrics.average_cpc,
        metrics.ctr
      FROM customer
      WHERE segments.date DURING LAST_30_DAYS
    `;

    const results = await customer.query(query);

    if (!results || results.length === 0) {
      return NextResponse.json({ 
        success: true, 
        metrics: { clicks: 0, impressions: 0, cost: 0, conversions: 0 } 
      });
    }

    // Process results (Google Ads returns cost in micros)
    const summary = results[0].metrics;
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
