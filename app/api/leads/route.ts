import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyUser } from "@/lib/auth-server";
import { sendLeadNotification } from "@/lib/resend";

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

    // Nota: El lead capture puede venir de la landing sin auth de sesión,
    // pero aquí se asume que userId se pasa para asociar el lead al profesional.
    
    const { data, error } = await supabase
      .from('leads')
      .insert([{ user_id: userId, name, email, source_campaign }])
      .select();

    if (error) throw error;

    const newLead = data[0];

    // NOTIFICACIÓN VÍA RESEND
    try {
      if (supabaseAdmin) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const professionalEmail = userData?.user?.email;
        if (professionalEmail) {
          await sendLeadNotification(professionalEmail, newLead);
        }
      }
    } catch (notifErr) {
      console.error("[Leads] Failed to send email notification:", notifErr);
      // No bloqueamos el éxito de la captura por un fallo en el correo
    }

    return NextResponse.json({ success: true, lead: newLead });

  } catch (error: any) {
    console.error("Lead Insert Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
