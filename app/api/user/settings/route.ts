import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"

    return NextResponse.json({ 
        success: true, 
        googleAdsId: data?.google_ads_id || null,
        campaignSurvey: data?.campaign_survey || null,
        currentCampaignId: data?.current_campaign_id || null,
        landingUrl: data?.landing_url || null,
        customDomain: data?.custom_domain || null,
        vercelProjectId: data?.vercel_project_id || null
    });

  } catch (error: any) {
    console.error("Fetch User Settings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, googleAdsId, campaignSurvey, landingUrl, vercelProjectId, customDomain } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const updateData: any = { user_id: userId, updated_at: new Date().toISOString() };
    if (googleAdsId) updateData.google_ads_id = googleAdsId;
    if (campaignSurvey) updateData.campaign_survey = campaignSurvey;
    if (landingUrl) updateData.landing_url = landingUrl;
    if (vercelProjectId) updateData.vercel_project_id = vercelProjectId;
    if (customDomain) updateData.custom_domain = customDomain;

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('user_settings')
      .upsert([updateData], { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error("Supabase Admin Upsert Error (Settings):", error);
      throw error;
    }

    return NextResponse.json({ success: true, settings: data[0] });

  } catch (error: any) {
    console.error("Save User Settings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...updates } = body;

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const client = supabaseAdmin || supabase;
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    
    if (updates.googleAdsId) dbUpdates.google_ads_id = updates.googleAdsId;
    if (updates.campaignSurvey) dbUpdates.campaign_survey = updates.campaignSurvey;
    if (updates.currentCampaignId) dbUpdates.current_campaign_id = updates.currentCampaignId;
    if (updates.landingUrl) dbUpdates.landing_url = updates.landingUrl;
    if (updates.customDomain) dbUpdates.custom_domain = updates.customDomain;
    if (updates.vercelProjectId) dbUpdates.vercel_project_id = updates.vercelProjectId;

    const { data, error } = await client
      .from('user_settings')
      .update(dbUpdates)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, settings: data[0] });

  } catch (error: any) {
    console.error("Patch User Settings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
