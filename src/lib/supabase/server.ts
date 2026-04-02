import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Next.js only allows mutating cookies in Server Actions/Route Handlers.
        // During Server Component renders, Supabase may still attempt cookie writes (refresh flow).
        // Swallow those writes here; session refresh is handled in `middleware.ts`.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // no-op
        }
      },
    },
  });
}

