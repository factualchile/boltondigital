import { GoogleAdsApi, enums } from "google-ads-api";

export { enums };

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
const MCC_ID = process.env.GOOGLE_ADS_MCC_ID!;

export const googleAdsClient = new GoogleAdsApi({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  developer_token: DEVELOPER_TOKEN,
});

/**
 * Obtiene un cliente de cuenta (Customer) de Google Ads intentando primero 
 * el modo MCC y luego el modo Standalone si falla.
 */
export async function getSmartCustomer(customerId: string) {
  const cleanedId = customerId.replace(/-/g, "");
  
  const tryConnect = async (useMcc: boolean) => {
    const config: any = {
      customer_id: cleanedId,
      refresh_token: REFRESH_TOKEN,
    };
    
    if (useMcc && MCC_ID) {
      config.login_customer_id = MCC_ID.replace(/-/g, "");
    }

    const customer = googleAdsClient.Customer(config);
    
    // Verificamos acceso rápido
    await customer.query(`SELECT customer.id FROM customer LIMIT 1`);
    return customer;
  };

  try {
    return await tryConnect(true);
  } catch (e) {
    console.warn(`[getSmartCustomer] Fallo MCC para ${cleanedId}. Reintentando Standalone...`);
    return await tryConnect(false);
  }
}
