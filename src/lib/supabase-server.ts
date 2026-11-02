import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/supabase";

// A Supabase client that acts as the signed-in user (session from cookies).
// Create a new one for every request; never share it between requests.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components can't set cookies. The proxy refreshes the
          // session instead, so this is safe to ignore here.
        }
      },
    },
  });
}
