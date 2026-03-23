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
    const campaignId = searchParams.get("campaignId");

    if (!customerId) return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    const isOwner = await verifyCustomer(req, customerId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const client = new GoogleAdsApi({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      developer_token: DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: customerId.replace(/-/g, ""),
      refresh_token: REFRESH_TOKEN,
      login_customer_id: MCC_ID,
    });

    // Query para obtener anuncios y su rendimiento individual
    const query = `
      SELECT 
        ad_group_ad.ad.id,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        metrics.clicks, 
        metrics.ctr,
        campaign.name
      FROM ad_group_ad 
      WHERE segments.date DURING LAST_30_DAYS
      AND ad_group_ad.status = 'ENABLED'
      ${campaignId ? `AND campaign.id = '${campaignId}'` : ""}
      LIMIT 10
    `;

    const results = await customer.query(query);

    const ads = results.map((row: any) => ({
      id: row.ad_group_ad.ad.id,
      campaign: row.campaign.name,
      headlines: row.ad_group_ad.ad.responsive_search_ad?.headlines?.map((h: any) => h.text) || [],
      descriptions: row.ad_group_ad.ad.responsive_search_ad?.descriptions?.map((d: any) => d.text) || [],
      clicks: row.metrics.clicks || 0,
      ctr: (row.metrics.ctr || 0) * 100
    })).sort((a: any, b: any) => b.clicks - a.clicks);

    return NextResponse.json({ success: true, ads });

  } catch (error: any) {
    console.error("Ads Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
