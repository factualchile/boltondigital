import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { GoogleAdsApi, enums } from "google-ads-api";
import OpenAI from "openai";
import { verifyUser } from "@/lib/auth-server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
});

const MCC_ID = process.env.GOOGLE_ADS_MCC_ID;

export async function POST(req: Request) {
  try {
    const { userId, customerId, type, campaignId, ...surveyData } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID missing" }, { status: 400 });

    // FASE 1: AUDITORÍA DE AISLAMIENTO
    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    let finalCampaignId = campaignId;

    if (type === 'create') {
      // FASE 3: BLOQUEO DE CAMPAÑA ÚNICA
      const clientDb = supabaseAdmin || supabase;
      const { data: currentSettings } = await clientDb
        .from('user_settings')
        .select('current_campaign_id')
        .eq('user_id', userId)
        .single();

      if (currentSettings?.current_campaign_id) {
        return NextResponse.json({ error: "Ya tienes una campaña activa. No se permiten duplicados." }, { status: 400 });
      }

      console.log(`[AdsEngineer] Iniciando aprovisionamiento para ${surveyData.profession}`);

      // 1. ANALÍTICA DE IA (ESTRATEGIA DE PRECISIÓN: KEYWORD + COPIES)
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: `Eres un Senior Ads Engineer de Bolton Digital. Tu misión es diseñar la estrategia para una campaña de Google Ads de alta precisión.
            
            REGLAS ESTRICTAS:
            1. Generar una única 'keyword' maestra (Concordancia de Frase sutil). Debe ser cómo lo buscaría un potencial cliente (ej: "Psicólogo en Concepción" o "Psicólogo Online").
            2. Generar 5 'headlines' (máx 30 carac.) y 2 'descriptions' (máx 90 carac.).
            3. El Primer Headline y la Primera Descripción DEBEN incluir la 'keyword' generada.
            4. Formato de respuesta: JSON con campos 'keyword', 'headlines' y 'descriptions'.` 
          },
          { role: "user", content: `Profesión: ${surveyData.profession}. Servicio: ${surveyData.service}. Modalidad: ${surveyData.modality}. Comuna/Ubicación: ${surveyData.commune || 'Online'}` }
        ],
        response_format: { type: "json_object" }
      });

      const copy = JSON.parse(aiResponse.choices[0].message?.content || "{}");
      // LIMPIEZA DE POLÍTICAS: Google rechaza símbolos como "" [] ! en las keywords de concordancia de frase
      const rawKeyword = copy.keyword || `${surveyData.profession} ${surveyData.commune || 'Online'}`;
      const finalKeyword = rawKeyword.replace(/["'\[\]!@#$%^&*()_=+]/g, "").trim();
      const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

      if (refreshToken && customerId) {
        try {
          const customer = client.Customer({
            customer_id: customerId.replace(/-/g, ""),
            refresh_token: refreshToken,
            login_customer_id: MCC_ID ? MCC_ID.replace(/-/g, "") : undefined,
          });

          // SECUENCIA ATÓMICA DE GOOGLE ADS - FASE 10: PRESUPUESTO SEGURO (~$8 USD = $8.000 CLP)
          const dailyBudgetMicros = 8000000000; // 8.000 CLP * 1.000.000
          const budgetRes = await customer.campaignBudgets.create([
            { 
              name: `Bolton OS Budget - ${Date.now()}`, 
              amount_micros: dailyBudgetMicros, 
              delivery_method: 'STANDARD'
            } as any
          ]);

          if (!budgetRes.results || budgetRes.results.length === 0) throw new Error("Failed to create budget");
          const budgetResourceName = budgetRes.results[0].resource_name;

          // B. Crear Campaña (Search, Pausada)
          const campaignRes = await customer.campaigns.create([
            { 
              name: `Bolton OS - ${surveyData.profession} - ${Date.now()}`,
              status: 'PAUSED',
              advertising_channel_type: 'SEARCH',
              network_settings: {
                target_google_search: true,
                target_search_network: false,
                target_content_network: false,
                target_partner_search_network: false
              },
              campaign_budget: budgetResourceName,
              contains_eu_political_advertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
              target_spend: {
                cpc_bid_ceiling_micros: 2300000000 // ~$2.3 USD = $2.300 CLP
              }
            } as any
          ]);

          if (!campaignRes.results || campaignRes.results.length === 0) throw new Error("Failed to create campaign");
          const campaignResourceName = campaignRes.results[0].resource_name as string;
          finalCampaignId = campaignResourceName.split('/').pop() || "";

          // B.2 Segmentación Geográfica (Chile) y Horaria (Lu-Vi 07:30-22:30)
          const scheduleDays = [
            enums.DayOfWeek.MONDAY, enums.DayOfWeek.TUESDAY, enums.DayOfWeek.WEDNESDAY, 
            enums.DayOfWeek.THURSDAY, enums.DayOfWeek.FRIDAY
          ];

          await customer.campaignCriteria.create([
            {
              campaign: campaignResourceName,
              status: 'ENABLED',
              location: {
                geo_target_constant: `geoTargetConstants/2152` 
              }
            } as any,
            ...scheduleDays.map(day => ({
              campaign: campaignResourceName,
              status: 'ENABLED',
              ad_schedule: {
                day_of_week: day,
                start_hour: 7,
                start_minute: 'THIRTY',
                end_hour: 22,
                end_minute: 'THIRTY'
              }
            } as any))
          ]);

          // C. Crear Grupo de Anuncios
          const adGroupRes = await customer.adGroups.create([
            { 
              name: "Principal", 
              campaign: campaignResourceName, 
              status: 'ENABLED',
              type: 'SEARCH_STANDARD'
            } as any
          ]);
          if (!adGroupRes.results || adGroupRes.results.length === 0) throw new Error("Failed to create ad group");
          const adGroupResourceName = adGroupRes.results[0].resource_name as string;

          // C.2 Inyección de Palabra Clave Única con Auto-Exención de Política (Fase 6)
          try {
            await customer.adGroupCriteria.create([
              {
                ad_group: adGroupResourceName,
                status: 'ENABLED',
                keyword: {
                  text: finalKeyword,
                  match_type: 'PHRASE'
                } as any
              }
            ]);
          } catch (err: any) {
            // Bici-intento: si falla por política, extraemos la clave y reintentamos con exención
            const policyKey = err.details?.[0]?.policy_violation_details?.key;
            if (policyKey) {
              console.log(`[AdsEngineer] Detectada política en Keyword. Solicitando exención automática...`);
              await customer.adGroupCriteria.create([
                {
                  ad_group: adGroupResourceName,
                  status: 'ENABLED',
                  keyword: { text: finalKeyword, match_type: 'PHRASE' } as any,
                  exempt_policy_violation_keys: [policyKey]
                } as any
              ]);
            } else {
              throw err;
            }
          }

          // D. Crear Anuncios (RSA)
          let finalWebsite = surveyData.website || "https://boltondigital.cl";
          if (!finalWebsite.startsWith('http://') && !finalWebsite.startsWith('https://')) {
            finalWebsite = `https://${finalWebsite}`;
          }

          try {
            await customer.adGroupAds.create([
              {
                ad_group: adGroupResourceName,
                status: 'ENABLED',
                ad: {
                  responsive_search_ad: {
                    headlines: (copy.headlines || []).map((h: string) => ({ text: h.slice(0, 30) })),
                    descriptions: (copy.descriptions || []).map((d: string) => ({ text: d.slice(0, 90) }))
                  },
                  final_urls: [finalWebsite]
                } as any
              }
            ]);
          } catch (err: any) {
            const policyKey = err.details?.[0]?.policy_violation_details?.key;
            if (policyKey) {
              console.log(`[AdsEngineer] Detectada política en Anuncio. Solicitando exención automática...`);
              await customer.adGroupAds.create([
                {
                  ad_group: adGroupResourceName,
                  status: 'ENABLED',
                  ad: {
                    responsive_search_ad: {
                      headlines: (copy.headlines || []).map((h: string) => ({ text: h.slice(0, 30) })),
                      descriptions: (copy.descriptions || []).map((d: string) => ({ text: d.slice(0, 90) }))
                    },
                    final_urls: [finalWebsite]
                  } as any,
                  exempt_policy_violation_keys: [policyKey]
                } as any
              ]);
            } else {
              throw err;
            }
          }

          console.log(`[AdsEngineer] APROVISIONAMIENTO EXITOSO: ${finalCampaignId}`);
        } catch (adsErr: any) {
          let errorMessage = adsErr.message;
          
          if (!errorMessage && adsErr.errors && Array.isArray(adsErr.errors)) {
            const firstErr = adsErr.errors[0];
            const fieldPath = firstErr.location?.field_path_elements?.map((f: any) => f.field_name).join(".") || "";
            errorMessage = `${firstErr.message}${fieldPath ? ` -> Campo: ${fieldPath}` : ""}`;
          }
          
          if (!errorMessage) {
            errorMessage = typeof adsErr === 'object' ? JSON.stringify(adsErr).slice(0, 100) : "Error Desconocido";
          }

          console.error("Ads API High-Level Error Detail:", {
            message: errorMessage,
            stack: adsErr.stack,
            details: adsErr.details || adsErr.response?.data
          });
          // EXPOSICIÓN DE ERROR EN UI PARA DIAGNÓSTICO (Solo en desarrollo)
          finalCampaignId = `GAS-ERROR: ${errorMessage.slice(0, 200)}`;
        }
      }
    }

    const supabaseClient = supabaseAdmin || supabase;
    // Persistencia Final
    await Promise.all([
      supabaseClient.from('user_settings').update({ campaign_survey: surveyData, current_campaign_id: finalCampaignId, updated_at: new Date().toISOString() }).eq('user_id', userId),
      supabaseClient.from('user_progress').update({ is_completed: true, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('instance_key', 'creacion')
    ]);

    return NextResponse.json({ success: true, campaignId: finalCampaignId });

  } catch (error: any) {
    console.error("Ads Engineer Fatal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
