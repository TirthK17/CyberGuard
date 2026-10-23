import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { authApi } from "@/lib/api/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const p = await authApi.getProfile(userId);
      if (p) {
        setProfile(p as unknown as Profile);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    // 1. Initial session check
    authApi.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        setSession(data.session);
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Session restore error:", err);
      if (active) setLoading(false);
    });

    // 2. Realtime auth state listener
    const { data: authListener } = authApi.onAuthStateChange(async (_event, newSession) => {
      if (!active) return;
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await loadProfile(newSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await authApi.signUp(email, password, fullName);
    return { error: res.error };
  };

  const signIn = async (email: string, password: string) => {
    const res = await authApi.signIn(email, password);
    if (!res.error && res.data?.user) {
      setUser(res.data.user);
      setSession(res.data.session);
      await loadProfile(res.data.user.id);
    }
    return { error: res.error };
  };

  const signInWithGoogle = async () => {
    const res = await authApi.signInWithGoogle();
    return { error: res.error };
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const res = await authApi.resetPassword(email);
    return { error: res.error };
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
