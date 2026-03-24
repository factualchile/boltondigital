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
