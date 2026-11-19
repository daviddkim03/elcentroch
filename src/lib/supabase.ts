import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Same Supabase project the Lovable site uses (hero_slides table, "hero" storage bucket,
// has_role RPC). If env vars are missing, the site falls back to the default slides.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;
