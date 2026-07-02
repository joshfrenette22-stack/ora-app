import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Created lazily (like audioCache's service client) so importing this module
// never throws — module-scope createClient breaks `next build` when the
// NEXT_PUBLIC_SUPABASE_* env vars aren't configured.
let client: SupabaseClient | null = null;
function instance(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = Reflect.get(instance(), prop);
    return typeof value === "function" ? value.bind(instance()) : value;
  },
});
