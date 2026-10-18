import { describe, it, expect, beforeEach, vi } from "vitest";
import { localDb } from "@/lib/localDb";

describe("Local Authentication & Role Security", () => {
  beforeEach(() => {
    localDb.resetDatabase();
  });

  it("returns null for getCurrentUser when there is no active session (no admin auto-login)", () => {
    const user = localDb.auth.getCurrentUser();
    expect(user).toBeNull();
  });

  it("rejects unknown email addresses without silently creating accounts", async () => {
    const res = await localDb.auth.signInWithPassword({
      email: "intruder@unknown-domain.com",
      password: "SomePassword123!",
    });

    expect(res.error).not.toBeNull();
    expect(res.error?.message).toContain("No account found");
    expect(localDb.auth.getCurrentUser()).toBeNull();
  });

  it("rejects incorrect passwords for existing accounts", async () => {
    const res = await localDb.auth.signInWithPassword({
      email: "admin@cyberguard.dev",
      password: "WrongPassword999!",
    });

    expect(res.error).not.toBeNull();
    expect(res.error?.message).toContain("Incorrect password");
    expect(localDb.auth.getCurrentUser()).toBeNull();
  });

  it("signs in successfully with seeded demo credentials and preserves role", async () => {
    // Admin login
    const adminRes = await localDb.auth.signInWithPassword({
      email: "admin@cyberguard.dev",
      password: "CyberGuard2026!",
    });
    expect(adminRes.error).toBeNull();
    const adminUser = localDb.auth.getCurrentUser();
    expect(adminUser).not.toBeNull();
    expect(adminUser?.email).toBe("admin@cyberguard.dev");
    expect(adminUser?.role).toBe("admin");

    // Sign out
    await localDb.auth.signOut();
    expect(localDb.auth.getCurrentUser()).toBeNull();

    // Regular Operator login
    const userRes = await localDb.auth.signInWithPassword({
      email: "operator@cyberguard.dev",
      password: "CyberGuard2026!",
    });
    expect(userRes.error).toBeNull();
    const normalUser = localDb.auth.getCurrentUser();
    expect(normalUser?.email).toBe("operator@cyberguard.dev");
    expect(normalUser?.role).toBe("user");
  });

  it("rejects sign-up with passwords shorter than 8 characters", async () => {
    const res = await localDb.auth.signUp({
      email: "shortpw@example.com",
      password: "short",
    });

    expect(res.error).not.toBeNull();
    expect(res.error?.message).toContain("at least 8 characters");
  });

  it("rejects sign-up for an email that already exists", async () => {
    const res = await localDb.auth.signUp({
      email: "admin@cyberguard.dev",
      password: "NewPassword123!",
    });

    expect(res.error).not.toBeNull();
    expect(res.error?.message).toContain("already exists");
  });

  it("creates new users with role 'user' regardless of email containing 'admin'", async () => {
    // Attempting privilege escalation via email naming
    const signupRes = await localDb.auth.signUp({
      email: "admin_wannabe@cyberguard.dev",
      password: "ValidPassword123!",
      options: { data: { full_name: "Sneaky Admin" } },
    });

    expect(signupRes.error).toBeNull();
    const newUser = localDb.auth.getCurrentUser();
    expect(newUser).not.toBeNull();
    expect(newUser?.email).toBe("admin_wannabe@cyberguard.dev");
    // MUST be 'user', never 'admin'
    expect(newUser?.role).toBe("user");

    // Verify session clears on sign out
    await localDb.auth.signOut();
    expect(localDb.auth.getCurrentUser()).toBeNull();

    // Verify the newly created salted password hash allows login
    const loginRes = await localDb.auth.signInWithPassword({
      email: "admin_wannabe@cyberguard.dev",
      password: "ValidPassword123!",
    });
    expect(loginRes.error).toBeNull();
    expect(localDb.auth.getCurrentUser()?.role).toBe("user");
  });

  it("fires onAuthStateChange listener on sign in and sign out", async () => {
    const authListener = vi.fn();
    const { data: sub } = localDb.auth.onAuthStateChange(authListener);

    // Initial state event fired
    expect(authListener).toHaveBeenCalledWith("INITIAL_SESSION", null);

    await localDb.auth.signInWithPassword({
      email: "operator@cyberguard.dev",
      password: "CyberGuard2026!",
    });

    expect(authListener).toHaveBeenCalledWith("SIGNED_IN", expect.objectContaining({
      user: expect.objectContaining({ email: "operator@cyberguard.dev" }),
    }));

    await localDb.auth.signOut();
    expect(authListener).toHaveBeenCalledWith("SIGNED_OUT", null);

    sub.subscription.unsubscribe();
  });
});
