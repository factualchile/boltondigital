-- BOLTON 3.0: CONFIGURACIÓN DE TOKENOMICS (EJECUTAR EN SQL EDITOR DE SUPABASE)

-- 1. Crear tabla de tokens
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    tokens_used INTEGER DEFAULT 0,
    monthly_limit INTEGER DEFAULT 500000,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear función RPC para incremento atómico
-- Esta función asegura que el conteo sea preciso incluso con múltiples clics rápidos.
CREATE OR REPLACE FUNCTION increment_tokens(u_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_tokens (user_id, tokens_used, last_reset)
    VALUES (u_id, amount, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET tokens_used = user_tokens.tokens_used + amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
