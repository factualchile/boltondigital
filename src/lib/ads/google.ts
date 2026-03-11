import { GoogleAdsApi, enums } from "google-ads-api";

const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
});

export async function getGoogleAdsMetrics(refreshToken: string, customerId: string, startDate: string, endDate: string) {
    const customer = client.Customer({
        customer_id: customerId,
        refresh_token: refreshToken,
    });

    const query = `
        SELECT 
            metrics.clicks, 
            metrics.impressions, 
            metrics.cost_micros, 
            metrics.conversions, 
            metrics.ctr, 
            metrics.average_cpc
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;

    try {
        const results = await customer.query(query);
        // Procesar resultados a formato legible
        return results;
    } catch (error) {
        console.error("Error fetching Google Ads metrics:", error);
        throw error;
    }
}
