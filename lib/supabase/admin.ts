import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// WARNING: This client uses the service role key and bypasses Row Level
// Security. Only import this in server-only code (API routes, route
// handlers). Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
