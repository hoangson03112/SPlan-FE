"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  LoginPayload,
  RegisterPayload,
} from "@/app/services/auth.service";
import { ApiError } from "@/app/lib/axios";
import { User } from "@/app/types/models";

export const meQueryKey = ["me"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: authService.getProfile,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiError, LoginPayload>({
    mutationFn: authService.login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiError, RegisterPayload>({
    mutationFn: authService.register,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiError, void>({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(meQueryKey, null);
      void queryClient.invalidateQueries();
    },
  });
}

export function useForgotPassword() {
  return useMutation<{ message: string }, ApiError, { email: string }>({
    mutationFn: authService.forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation<
    { message: string },
    ApiError,
    { token: string; password: string }
  >({
    mutationFn: authService.resetPassword,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<User, ApiError, { name?: string }>({
    mutationFn: authService.updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user);
    },
  });
}

export function useChangePassword() {
  return useMutation<
    { message: string },
    ApiError,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: authService.changePassword,
  });
}
