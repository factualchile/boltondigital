import { NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { verifyUser } from "@/lib/auth-server";

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
const MCC_ID = process.env.GOOGLE_ADS_MCC_ID!;

export async function POST(req: Request) {
  // Verificación preventiva de infraestructura
  if (!CLIENT_ID || !CLIENT_SECRET || !DEVELOPER_TOKEN || !REFRESH_TOKEN || !MCC_ID) {
    console.error("Faltan variables de entorno críticas de Google Ads");
    return NextResponse.json({ 
        error: "Infraestructura Incompleta", 
        details: "El servidor de Bolton no tiene configuradas todas las credenciales necesarias (ENV VARS)." 
    }, { status: 500 });
  }

  let cleanedId = "";
  try {
    const { customerId, userId } = await req.json();
    
    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // FASE 2: SEGURIDAD DE CONEXIÓN
    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    cleanedId = customerId.replace(/-/g, "");
    
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
      const customerInfo = results[0] as any;
      return NextResponse.json({ 
        success: true, 
        name: customerInfo.customer.descriptive_name,
        id: customerInfo.customer.id 
      });
    }

    return NextResponse.json({ error: "Could not find account" }, { status: 404 });

  } catch (error: any) {
    console.error("Google Ads Connection Error Details:", {
      customerId: cleanedId,
      mccId: MCC_ID,
      errorResponse: error.response?.data,
      errorMessage: error.message
    });
    const details = error.response?.data?.error?.message || error.message || "No details available";
    return NextResponse.json({ 
      error: "Failed to connect to Google Ads",
      details
    }, { status: 500 });
  }
}
