-- BOLTON 3.0: ESTRUCTURA COMPLEMENTARIA

-- 1. ACADEMIA (Cursos y Progreso)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration TEXT,
    total_lessons INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    course_id UUID REFERENCES courses(id),
    progress_percent INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 2. LABORATORIO (Sugerencias y Experimentos)
CREATE TABLE IF NOT EXISTS lab_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tool_id TEXT NOT NULL,
    parameters JSONB,
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLON DE CLAUDIO (Consultas no resueltas)
CREATE TABLE IF NOT EXISTS unresolved_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    query TEXT NOT NULL,
    campaign_id TEXT,
    ai_response TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MARKETPLACE (Feedback y Sugerencias de Asistentes)
CREATE TABLE IF NOT EXISTS assistant_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    suggestion TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. TOKENOMICS (Gestión de cuotas de IA)
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    tokens_used INTEGER DEFAULT 0,
    monthly_limit INTEGER DEFAULT 500000,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    welcome_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- FUNCIÓN PARA INCREMENTO ATÓMICO DE TOKENS
CREATE OR REPLACE FUNCTION increment_tokens(u_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_tokens (user_id, tokens_used)
    VALUES (u_id, amount)
    ON CONFLICT (user_id)
    DO UPDATE SET tokens_used = user_tokens.tokens_used + amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
