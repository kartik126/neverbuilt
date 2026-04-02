import { z } from "zod";

const rawEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1).optional(),
});

type RawEnv = z.infer<typeof rawEnvSchema>;

export type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_KEY: string;
};

function resolveSupabaseKey(raw: RawEnv): string {
  const key = raw.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!key) {
    throw new Error(
      "Missing Supabase key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
    );
  }
  return key;
}

const raw: RawEnv = rawEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
});

export const env: Env = {
  NEXT_PUBLIC_SUPABASE_URL: raw.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_KEY: resolveSupabaseKey(raw),
};

