import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Password-reset links arrive as #...&type=recovery. Read it before the client
// is created, because the client clears the hash while signing the person in.
export const openedFromRecoveryLink =
  typeof window !== "undefined" && window.location.hash.includes("type=recovery");

// Without the env vars the site still works, with the built-in slides and no login.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

// Off until the portal's database migration has been run on the project.
export const portalOn = !!supabase && process.env.NEXT_PUBLIC_MEMBER_PORTAL === "on";

/** Which sign-in providers the project has switched on (Google, Kakao...). */
export async function enabledProviders(): Promise<Record<string, boolean>> {
  if (!url || !key) return {};
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
    return res.ok ? (await res.json()).external ?? {} : {};
  } catch {
    return {};
  }
}
