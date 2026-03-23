import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('user_progress')
      .select('category, instance_key, is_active, is_completed')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, progress: data || [] });

  } catch (error: any) {
    console.error("Fetch User Progress Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, category, instanceKey, isActive, isCompleted } = await req.json();

    if (!userId || !category || !instanceKey) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const updateData: any = { 
        user_id: userId, 
        category, 
        instance_key: instanceKey, 
        updated_at: new Date().toISOString() 
    };

    if (isActive !== undefined) updateData.is_active = isActive;
    if (isCompleted !== undefined) updateData.is_completed = isCompleted;

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('user_progress')
      .upsert([updateData], { onConflict: 'user_id, category, instance_key' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, progress: data[0] });

  } catch (error: any) {
    console.error("Save User Progress Internal Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
