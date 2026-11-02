import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase";

// A Supabase client with the secret service-role key. It bypasses Row Level
// Security, so only use it on the server, only after getAdmin() has confirmed
// the caller is an admin, and only for things the normal client can't do
// (creating staff login accounts).
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local to manage staff accounts."
    );
  }

  return createClient(supabaseConfig.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
