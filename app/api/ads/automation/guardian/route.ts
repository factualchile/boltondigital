import { NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { supabase } from "@/lib/supabase";

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
const MCC_ID = process.env.GOOGLE_ADS_MCC_ID!;

export async function POST(req: Request) {
  try {
    const { customerId, campaigns, userId } = await req.json();

    if (!customerId || !campaigns || !Array.isArray(campaigns)) {
      return NextResponse.json({ error: "Required data missing" }, { status: 400 });
    }

    const client = new GoogleAdsApi({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, developer_token: DEVELOPER_TOKEN });
    const customer = client.Customer({ customer_id: customerId.replace(/-/g, ""), refresh_token: REFRESH_TOKEN, login_customer_id: MCC_ID });

    const pausedCampaigns = [];

    for (const camp of campaigns) {
      const spendThreshold = 40;
      if (camp.status === 'ENABLED' && camp.cost > spendThreshold && camp.conversions === 0 && (camp.tag === 'ALERTA')) {
        
        await customer.campaigns.update({
          resource_name: `customers/${customerId.replace(/-/g, "")}/campaigns/${camp.id}`,
          status: 'PAUSED'
        });

        // Registrar en Historia (Fase 22)
        if (userId) {
          await supabase.from('growth_history').insert([{
            user_id: userId,
            action_title: `Gasto Crítico Detenido`,
            action_type: 'AUTO_PAUSE',
            impact_summary: `Pausamos la campaña "${camp.name}" para ahorrar capital de inversión.`
          }]);
        }

        pausedCampaigns.push(camp.name);
      }
    }

    return NextResponse.json({ success: true, pausedCount: pausedCampaigns.length, pausedCampaigns });

  } catch (error: any) {
    console.error("Guardian Automation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
