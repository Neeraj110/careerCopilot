"use client";

import { create } from "zustand";
import { authApi } from "@/lib/api/auth";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      set({
        user: res.data.user as unknown as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Login failed",
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register({ email, password });
      set({
        user: res.data.user as unknown as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Registration failed",
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await authApi.getProfile();
      set({ user: res.data as unknown as User, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  clearError: () => set({ error: null }),
}));
