import { NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
const MCC_ID = process.env.GOOGLE_ADS_MCC_ID!;

export async function POST(req: Request) {
  try {
    const { customerId, campaignId, status } = await req.json();

    if (!customerId || !campaignId || !status) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

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

    // Ejecutar el cambio de estado en Google Ads
    await customer.campaigns.update({
      resource_name: `customers/${customerId.replace(/-/g, "")}/campaigns/${campaignId}`,
      status: status // 'PAUSED' o 'ENABLED'
    });

    return NextResponse.json({ 
      success: true, 
      message: `Campaña ${campaignId} actualizada a ${status}`
    });

  } catch (error: any) {
    console.error("Google Ads Write Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to update campaign",
      details: error.response?.data?.error?.message
    }, { status: 500 });
  }
}
