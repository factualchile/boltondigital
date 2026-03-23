import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, leads: data });

  } catch (error: any) {
    console.error("Leads Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, name, email, source_campaign } = await req.json();

    if (!userId || !name || !email) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const { data, error } = await supabase
      .from('leads')
      .insert([{ user_id: userId, name, email, source_campaign }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: data[0] });

  } catch (error: any) {
    console.error("Lead Insert Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
