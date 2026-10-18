import { createClient } from "@supabase/supabase-js";
import { localDb } from "./localDb";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase client factory.
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in the environment,
 * connects to live Supabase. Otherwise, seamlessly falls back to localDb for 100% offline execution.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: typeof localDb = (isSupabaseConfigured
  ? (createClient(supabaseUrl!, supabaseAnonKey!) as unknown as typeof localDb)
  : localDb);

export { localDb };
