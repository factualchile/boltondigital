import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente estándar (anon) para el lado del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente administrador para el lado del servidor (API) que se salta RLS
// Se usa condicionalmente para evitar errores en el cliente (navegador)
export const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null as any; 
