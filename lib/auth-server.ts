import { supabase } from "./supabase";

/**
 * Verifica que el userId proporcionado coincide con el usuario autenticado
 * mediante el token de autorización enviado en el header.
 */
export async function verifyUser(req: Request, userId: string): Promise<boolean> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.warn(`[AuthAudit] Header de Autorización faltante para el usuario: ${userId}`);
      return false;
    }

    const token = authHeader.replace("Bearer ", "");
    // Usamos el cliente anon para verificar el token del usuario final
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error(`[AuthAudit] Token inválido o sesión expirada:`, error?.message);
      return false;
    }
    
    if (user.id !== userId) {
      console.warn(`[AuthAudit] Intento de acceso cruzado detectado. Token: ${user.id} vs Solicitado: ${userId}`);
      return false;
    }

    return true;
  } catch (e: any) {
    console.error(`[AuthAudit] Error crítico en verificación:`, e.message);
    return false;
  }
}

/**
 * Verifica que el customerId pertenece al usuario autenticado.
 */
export async function verifyCustomer(req: Request, customerId: string): Promise<boolean> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return false;

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return false;

    // Verificar en la base de datos si este customerId está asociado al usuario
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('google_ads_id')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings) return false;

    // Comparar ID (limpiando guiones por si acaso)
    const cleanReqId = customerId.replace(/-/g, "");
    const cleanDbId = settings.google_ads_id?.replace(/-/g, "");

    return cleanReqId === cleanDbId;
  } catch (e) {
    return false;
  }
}
