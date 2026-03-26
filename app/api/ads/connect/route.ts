import { NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { verifyUser } from "@/lib/auth-server";
import { supabaseAdmin, supabase } from "@/lib/supabase";

const client_sb = supabaseAdmin || supabase;

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

    // SISTEMA DE CONEXIÓN INTELIGENTE (Standalone VS Managed)
    const tryConnect = async (useMcc: boolean) => {
        console.log(`[Bolton Engine] Intentando conexión (Modo MCC: ${useMcc})...`);
        const customerConfig: any = {
            customer_id: cleanedId,
            refresh_token: REFRESH_TOKEN,
        };
        
        // Solo inyectamos el login_customer_id si estamos en modo MCC
        if (useMcc && MCC_ID) {
            customerConfig.login_customer_id = MCC_ID.replace(/-/g, "");
        } else {
            // Standalone: no usamos manager_id
        }

        const customer = client.Customer(customerConfig);

        const results = await customer.query(`
            SELECT customer.id, customer.descriptive_name 
            FROM customer 
            LIMIT 1
        `);

        if (results && results.length > 0) {
            return results[0] as any;
        }
        return null;
    }

    let customerInfo = null;
    let fallbackUsed = false;

    try {
        // Intento 1: Como cuenta gestionada (MCC)
        customerInfo = await tryConnect(true);
    } catch (e: any) {
        console.warn("[Bolton Engine] Falló la conexión inicial MCC. Iniciando rescate Standalone...");
        try {
            // Intento 2 (Fallback): Como cuenta independiente (Standalone)
            customerInfo = await tryConnect(false);
            if (customerInfo) fallbackUsed = true;
        } catch (e2: any) {
            console.error("[Bolton Engine] Fallo total en ambos modos.");
            // Propagamos el error segundo si también falla, es más probable que sea el real (como invalid_grant)
            throw e2; 
        }
    }

    if (customerInfo) {
      console.log(`[Bolton Engine] ¡Éxito! Conectado a: ${customerInfo.customer.descriptive_name} (Modo Standalone: ${fallbackUsed})`);
      
      // 📝 LOG DE ACTIVIDAD REAL
      if (userId) {
        // 📝 LOG DE ACTIVIDAD REAL (BLINDADO)
        try {
            await client_sb.from('user_activity_log').insert([{
                user_id: userId,
                action_type: 'LINK_CAMPAIGN',
                description: `Se vinculó la campaña a la cuenta: ${customerInfo.customer.descriptive_name} (${cleanedId})`,
                meta_data: { 
                    customer_id: cleanedId, 
                    customer_name: customerInfo.customer.descriptive_name,
                    standalone: fallbackUsed
                }
            }]);
        } catch (logError) {
            console.error("[Bolton Engine] No se pudo guardar el log de actividad, pero la conexión fue exitosa:", logError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        name: customerInfo.customer.descriptive_name,
        id: customerInfo.customer.id,
        standalone: fallbackUsed
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
