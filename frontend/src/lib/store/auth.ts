import { create } from "zustand";

// ── Types ──
export interface User {
  id: string;
  name: string | null;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Zustand Store ──
let hydratePromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  hydrate: async () => {
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/refresh`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // ignore network errors for hydration
      }
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    })();

    try {
      await hydratePromise;
    } finally {
      hydratePromise = null;
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
      });
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred." };
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
      });
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred." };
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore failures on logout endpoint
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
