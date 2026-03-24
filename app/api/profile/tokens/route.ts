import { NextResponse } from 'next/server';
import { getUserTokens } from '@/lib/tokenomics';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const usage = await getUserTokens(userId);

    return NextResponse.json(usage);
  } catch (error: any) {
    console.error('Error in /api/profile/tokens:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
