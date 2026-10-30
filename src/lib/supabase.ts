import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { localDb } from "./localDb";

const isTestMode = typeof import.meta !== "undefined" && import.meta.env?.MODE === "test";
const rawUrl = isTestMode ? undefined : (import.meta.env.VITE_SUPABASE_URL as string | undefined);
const rawAnonKey = isTestMode ? undefined : (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawAnonKey &&
  rawUrl.trim() !== "" &&
  rawAnonKey.trim() !== "" &&
  !rawUrl.includes("your-project") &&
  !rawAnonKey.includes("your-anon-key")
);

const activeUrl = isSupabaseConfigured ? rawUrl! : "https://placeholder.supabase.co";
const activeKey = isSupabaseConfigured ? rawAnonKey! : "placeholder-anon-key";

/**
 * Production Supabase Client instance.
 * Strictly typed with Database schema types from src/types/database.ts.
 * Only public anon key is used; service_role key is never included in client code.
 * Falls back to localDb in test mode or when offline.
 */
export const supabase: SupabaseClient<Database> = isSupabaseConfigured
  ? createClient<Database>(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "cyberguard_supabase_auth_session",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : (localDb as unknown as SupabaseClient<Database>);

export { localDb };
