import { NextResponse } from "next/server";
import { GoogleAdsApi, GoogleAdsNodeOptions } from "google-ads-api";

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
const MCC_ID = process.env.GOOGLE_ADS_MCC_ID!;

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();
    
    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const cleanedId = customerId.replace(/-/g, "");

    // Initialize the Google Ads API client
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

    // Test the connection by fetching basic info
    // This will throw an error if the connection fails or access is denied
    const results = await customer.query(`
      SELECT customer.id, customer.descriptive_name 
      FROM customer 
      LIMIT 1
    `);

    if (results && results.length > 0) {
      return NextResponse.json({ 
        success: true, 
        name: results[0].customer.descriptive_name,
        id: results[0].customer.id 
      });
    }

    return NextResponse.json({ error: "Could not find account" }, { status: 404 });

  } catch (error: any) {
    console.error("Google Ads Connection Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to connect to Google Ads",
      details: error.response?.data?.error?.message
    }, { status: 500 });
  }
}
