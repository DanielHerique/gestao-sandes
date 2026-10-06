import { createClient } from "@supabase/supabase-js";

// Cliente com service role: ignora RLS. Usar apenas no servidor, depois de
// validar quem está chamando (requireProfile / requireAdmin).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
