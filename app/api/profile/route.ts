import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usamos Service Role para asegurar persistencia bypassando RLS en esta etapa de desarrollo
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, customerId } = await req.json();

    if (!userId || !customerId) {
        return NextResponse.json({ error: "Missing identity data" }, { status: 400 });
    }

    // Guardar (Upsert) en la tabla 'profiles'
    // Asumimos que la tabla tiene 'id' (id de usuario de auth) y 'google_ads_id'
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ 
        id: userId, 
        google_ads_id: customerId,
        updated_at: new Date().toISOString() 
      }, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Profile Save Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const { data, error } = await supabase
      .from("profiles")
      .select("google_ads_id")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") { // Error PGRST116 es 'No rows found'
      throw error;
    }

    return NextResponse.json({ success: true, customerId: data?.google_ads_id || null });
  } catch (err: any) {
    console.error("Profile Get Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
