import { useEffect, useState } from "react";
import { authAPI } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  fullName?: string;
}

export function useAuth() {
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Always clear legacy tokens
    localStorage.removeItem("token");

    // Fetch fresh user profile from secure HttpOnly cookie session
    authAPI
      .getMe()
      .then((userData) => {
        setUser(userData);
        setSession({ user: userData });
        localStorage.setItem("user", JSON.stringify(userData));
      })
      .catch(() => {
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  return { session, user, loading, error };
}

export async function signUp(
  email: string,
  password: string,
  fullName?: string,
) {
  try {
    const result = await authAPI.signUp(email, password, fullName);
    // Token is now set securely via HttpOnly cookies by the backend
    localStorage.setItem("user", JSON.stringify(result.user));
    return { ok: true, user: result.user };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const result = await authAPI.signIn(email, password);
    // Token is now set securely via HttpOnly cookies by the backend
    localStorage.setItem("user", JSON.stringify(result.user));
    return { ok: true, user: result.user };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

export function signOut() {
  authAPI.logout().finally(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  });
}
