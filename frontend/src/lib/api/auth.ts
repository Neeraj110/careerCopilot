import { api } from "../api";
import type { ApiResponse, AuthResponse, User } from "@/types";

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data, {
      skipAuth: true,
    }),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data, {
      skipAuth: true,
    }),

  logout: () => api.post<{ message: string }>("/auth/logout"),

  getProfile: () => api.get<ApiResponse<User>>("/auth/profile"),

  updateProfile: (data: { name: string }) => api.put<ApiResponse<User>>("/auth/profile", data),

  changePassword: (data: any) => api.post<ApiResponse<any>>("/auth/password", data),
};
