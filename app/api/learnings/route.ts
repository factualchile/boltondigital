import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const { data, error } = await supabase
      .from('learnings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ success: true, learnings: data });

  } catch (error: any) {
    console.error("Fetch Learnings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, title, content, category, priority } = await req.json();

    if (!userId || !title || !content) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const { data, error } = await supabase
      .from('learnings')
      .insert([{ user_id: userId, title, content, category, priority: priority || 1 }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, learning: data[0] });

  } catch (error: any) {
    console.error("Create Learning Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
