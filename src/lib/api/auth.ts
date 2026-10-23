import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type ProfileRecord = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const authApi = {
  async getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error: error ? error.message : null };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error ? error.message : null };
  },

  async signInWithGoogle() {
    const redirectTo = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    return { data, error: error ? error.message : null };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  async resetPassword(email: string) {
    const redirectTo = `${window.location.origin}/settings`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { data, error: error ? error.message : null };
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error: error ? error.message : null };
  },

  async getProfile(userId: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }
    return data;
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<{ data: ProfileRecord | null; error: string | null }> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .maybeSingle();

    return { data, error: error ? error.message : null };
  },
};
