import { NextResponse } from "next/server";
import { sendInsightEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { email, insight, metrics } = await req.json();

    if (!email || !insight || !metrics) {
      return NextResponse.json({ error: "Email, insight and metrics are required" }, { status: 400 });
    }

    const { success, error } = await sendInsightEmail(email, insight, metrics);

    if (!success) {
      return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Notification API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to trigger notification",
    }, { status: 500 });
  }
}
