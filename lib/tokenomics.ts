import { supabaseAdmin } from './supabase';

export interface TokenUsage {
  tokens_used: number;
  monthly_limit: number;
  last_reset: string;
  welcome_sent: boolean;
}

const DEFAULT_LIMIT = 500000;

export async function getUserTokens(userId: string): Promise<TokenUsage> {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  let { data, error } = await supabaseAdmin
    .from('user_tokens')
    .select('tokens_used, monthly_limit, last_reset, welcome_sent')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // Si no existe, lo creamos con valores seguros
    const { data: newData, error: createError } = await supabaseAdmin
      .from('user_tokens')
      .insert({ 
        user_id: userId, 
        tokens_used: 0, 
        monthly_limit: DEFAULT_LIMIT, 
        last_reset: new Date().toISOString(), 
        welcome_sent: false 
      })
      .select()
      .single();
    
    if (createError) throw createError;
    return newData as TokenUsage;
  }

  // Asegurar que no regresen nulos a la UI
  const usage: TokenUsage = {
    tokens_used: data.tokens_used ?? 0,
    monthly_limit: data.monthly_limit ?? DEFAULT_LIMIT,
    last_reset: data.last_reset ?? new Date().toISOString(),
    welcome_sent: !!data.welcome_sent
  };

  // Verificar si hay que resetear (nuevo mes)
  const lastReset = new Date(usage.last_reset);
  const now = new Date();
  
  if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    const { data: resetData, error: resetError } = await supabaseAdmin
      .from('user_tokens')
      .update({ tokens_used: 0, last_reset: now.toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
      
    if (resetError) throw resetError;
    return resetData as TokenUsage;
  }

  return usage;
}

export async function canConsume(userId: string): Promise<boolean> {
  try {
    const usage = await getUserTokens(userId);
    return usage.tokens_used < usage.monthly_limit;
  } catch (e) {
    console.error("Error checking token usage:", e);
    return true; // Fall-safe
  }
}

export async function consumeTokens(userId: string, amount: number) {
  if (!supabaseAdmin) return;

  try {
    const { error } = await supabaseAdmin.rpc('increment_tokens', { 
      u_id: userId, 
      amount: amount 
    });

    if (error) {
       console.warn("RPC increment_tokens falló o no existe. Usando fallback no-atómico.", error);
       const { data } = await supabaseAdmin
        .from('user_tokens')
        .select('tokens_used')
        .eq('user_id', userId)
        .single();
        
       await supabaseAdmin
        .from('user_tokens')
        .update({ tokens_used: (data?.tokens_used || 0) + amount })
        .eq('user_id', userId);
    }
  } catch (e) {
    console.error("Error consuming tokens:", e);
  }
}
