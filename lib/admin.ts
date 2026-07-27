import { createClient } from "@/lib/supabase/server";

// Admin access is controlled entirely from Supabase: set is_admin = true on
// a row in the profiles table (via the Supabase dashboard's Table Editor,
// or a SQL query) to grant someone admin access. No code changes needed.
export async function getAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return null;
  }

  return user;
}
