import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, recommendationTitle, decision, customerId } = await req.json();

    if (!userId || !recommendationTitle || !decision) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Guardar la decisión en Supabase para futuro entrenamiento/ajuste del modelo
    // const { error } = await supabase.from('decisions').insert([{
    //   user_id: userId,
    //   customer_id: customerId,
    //   title: recommendationTitle,
    //   decision: decision, // 'ACCEPTED', 'DISMISSED', 'LATER'
    //   created_at: new Date().toISOString()
    // }]);

    console.log(`User ${userId} decided ${decision} for: ${recommendationTitle}`);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Feedback Decision API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to record decision",
    }, { status: 500 });
  }
}
