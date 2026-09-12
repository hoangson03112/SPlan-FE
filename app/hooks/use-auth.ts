"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  LoginPayload,
  RegisterPayload,
} from "@/app/services/auth.service";
import { ApiError } from "@/app/lib/axios";

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
