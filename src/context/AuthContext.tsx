import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { localDb } from "@/lib/localDb";
import type { Profile } from "@/types";

export interface LocalAuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: LocalAuthUser | null;
  session: { user: LocalAuthUser } | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchUser: (role: "user" | "admin") => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalAuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await localDb.from("profiles").select("*").eq("id", userId).single();
    if (data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    let active = true;

    localDb.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email });
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: sub } = localDb.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user) {
        setUser({ id: newSession.user.id, email: newSession.user.email });
        await loadProfile(newSession.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await localDb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error ? "Failed to create account" : null };
  };

  const signIn = async (email: string, password?: string) => {
    const { error } = await localDb.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signInWithGoogle = async () => {
    await localDb.auth.signInWithOAuth({ provider: "google" });
    return { error: null };
  };

  const signOut = async () => {
    await localDb.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const switchUser = (role: "user" | "admin") => {
    const email = role === "admin" ? "admin@cyberguard.dev" : "operator@cyberguard.dev";
    signIn(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
        switchUser,
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
