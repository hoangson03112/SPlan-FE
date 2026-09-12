import { apiClient } from "@/app/lib/axios";
import { User } from "@/app/types/models";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const res = await apiClient.post<{ message: string }>(
      "/auth/login",
      payload,
    );
    return res.data;
  },

  async register(payload: RegisterPayload) {
    const res = await apiClient.post<{ message: string }>(
      "/auth/register",
      payload,
    );
    return res.data;
  },

  async logout() {
    const res = await apiClient.post<{ message: string }>("/auth/logout");
    return res.data;
  },

  async getProfile() {
    const res = await apiClient.get<User>("/auth/profile");
    return res.data;
  },
};
