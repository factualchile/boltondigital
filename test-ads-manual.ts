
import { GoogleAdsApi } from "google-ads-api";
import * as fs from "fs";

// Simple env loader
const envFile = fs.readFileSync(".env.local", "utf8");
const env: any = {};
envFile.split("\n").forEach(line => {
  const [key, ...val] = line.split("=");
  if (key && val.length > 0) env[key.trim()] = val.join("=").trim().replace(/"/g, "");
});

const client = new GoogleAdsApi({
  client_id: env.GOOGLE_ADS_CLIENT_ID,
  client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

async function main() {
  const customerId = "2376893801";
  console.log(`--- INICIANDO TEST PARA CUENTA ${customerId} ---`);
  
  const refresh_token = env.GOOGLE_ADS_REFRESH_TOKEN;
  const mcc_id = (env.GOOGLE_ADS_MCC_ID || "").replace(/-/g, "");

  const tryMode = async (mcc: string | undefined) => {
    console.log(`Probando modo: ${mcc ? "MCC (" + mcc + ")" : "STANDALONE"}`);
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: refresh_token,
      login_customer_id: mcc,
    });

    const query = "SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.status != 'REMOVED'";
    const results = await customer.query(query);
    return results;
  };

  try {
    const results = await tryMode(mcc_id);
    console.log(`¡ÉXITO MCC! Campañas encontradas: ${results.length}`);
    results.forEach((r: any) => console.log(`- ${r.campaign.name} (${r.campaign.id})`));
  } catch (e: any) {
    console.error("ERROR EN MODO MCC:", e.message);
    console.log("Reintentando Standalone...");
    try {
      const results = await tryMode(undefined);
      console.log(`¡ÉXITO STANDALONE! Campañas encontradas: ${results.length}`);
      results.forEach((r: any) => console.log(`- ${r.campaign.name} (${r.campaign.id})`));
    } catch (e2: any) {
      console.error("FALLO TOTAL:", e2.message);
    }
  }
}

main().catch(console.error);
