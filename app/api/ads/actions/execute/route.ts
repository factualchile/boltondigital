import { NextResponse } from "next/server";
import { getSmartCustomer, enums } from "@/lib/google-ads";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";
import { sendActionNotification } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { userId, actionId, campaignId, value, customerId } = await req.json();
    if (!userId || !actionId || !campaignId || !customerId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const db = supabaseAdmin || supabase;
    const customer = await getSmartCustomer(customerId);
    const campaignResourceName = `customers/${customerId.replace(/-/g, "")}/campaigns/${campaignId}`;

    let details = "";
    let actionLabel = "";

    // 1. Ejecutar Acción en Google Ads
    if (actionId === 'ENABLE_CAMPAIGN') {
      await customer.campaigns.update([{
        resource_name: campaignResourceName,
        status: enums.CampaignStatus.ENABLED
      }]);
      actionLabel = "Activar Campaña";
      details = "Se ha cambiado el estado de la campaña a HABILITADO.";
    } 
    else if (actionId === 'PAUSE_CAMPAIGN') {
      await customer.campaigns.update([{
        resource_name: campaignResourceName,
        status: enums.CampaignStatus.PAUSED
      }]);
      actionLabel = "Pausar Campaña";
      details = "Se ha pausado la campaña para revisión estratégica.";
    }
    else if (actionId === 'INCREASE_BUDGET') {
      const campaignData = (await customer.query(`
        SELECT campaign.campaign_budget FROM campaign WHERE campaign.id = '${campaignId}'
      `)) as any[];
      
      if (!campaignData?.[0]?.campaign?.campaign_budget) throw new Error("No se encontró el presupuesto de la campaña.");
      const budgetResourceName = campaignData[0].campaign.campaign_budget;
      
      const budgetData = (await customer.query(`
        SELECT campaign_budget.amount_micros FROM campaign_budget WHERE campaign_budget.resource_name = '${budgetResourceName}'
      `)) as any[];
      
      if (!budgetData?.[0]?.campaign_budget) throw new Error("No se pudo obtener la información de presupuesto.");
      const currentMicros = budgetData[0].campaign_budget.amount_micros;
      
      if (currentMicros === undefined || currentMicros === null) throw new Error("Monto de presupuesto no definido.");

      const multiplier = 1 + (value / 100);
      const newMicros = Math.round(currentMicros * multiplier);

      await customer.campaignBudgets.update([{
        resource_name: budgetResourceName,
        amount_micros: newMicros
      }]);
      
      actionLabel = `Aumento de Presupuesto (+${value}%)`;
      details = `Se aumentó el presupuesto diario de ${(currentMicros/1000000).toLocaleString('es-CL')} a ${(newMicros/1000000).toLocaleString('es-CL')}.`;
    }

    // 2. Registrar en Historial (Supabase)
    // Asumimos que podemos insertar en una tabla de logs o usar user_progress como proxy
    // Por ahora, creamos un registro de auditoría en una tabla 'bolton_audit_log'
    await db.from('user_progress').insert({
      user_id: userId,
      category: 'historial',
      instance_key: `action_${Date.now()}`,
      is_completed: true,
      updated_at: new Date().toISOString()
      // Podríamos añadir metadata si la tabla lo permite, por ahora usamos campos existentes
    });

    // 3. Notificar por Correo
    const { data: userProfile } = await db.from('user_settings').select('email').eq('user_id', userId).single();
    if (userProfile?.email) {
      await sendActionNotification(userProfile.email, actionLabel, details);
    }

    return NextResponse.json({ success: true, actionLabel, details });

  } catch (error: any) {
    console.error("Action Execution Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
