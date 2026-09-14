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

  async forgotPassword(payload: { email: string }) {
    const res = await apiClient.post<{ message: string }>(
      "/auth/forgot-password",
      payload,
    );
    return res.data;
  },

  async resetPassword(payload: { token: string; password: string }) {
    const res = await apiClient.post<{ message: string }>(
      "/auth/reset-password",
      payload,
    );
    return res.data;
  },

  async updateProfile(payload: { name?: string }) {
    const res = await apiClient.patch<User>("/auth/profile", payload);
    return res.data;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }) {
    const res = await apiClient.post<{ message: string }>(
      "/auth/change-password",
      payload,
    );
    return res.data;
  },
};
