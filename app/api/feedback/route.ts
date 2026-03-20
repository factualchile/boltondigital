import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, customerId, feedback, insightId } = await req.json();

    if (!userId || feedback === undefined) {
      return NextResponse.json({ error: "User ID and feedback are required" }, { status: 400 });
    }

    // In a real scenario, we save this to a 'feedback' table in Supabase
    // const { error } = await supabase.from('feedback').insert([{ 
    //   user_id: userId, 
    //   customer_id: customerId, 
    //   is_helpful: feedback, 
    //   insight_text: insightId 
    // }]);
    
    console.log(`Feedback received from ${userId}: ${feedback ? 'Helpful' : 'Not helpful'}`);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to record feedback",
    }, { status: 500 });
  }
}
