import { api } from "../api";
import type { ApiResponse, AuthResponse, User } from "@/types";

export const authApi = {
  register: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data, {
      skipAuth: true,
    }),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data, {
      skipAuth: true,
    }),

  logout: () => api.post<{ message: string }>("/auth/logout"),

  getProfile: () => api.get<ApiResponse<User>>("/auth/profile"),
};
