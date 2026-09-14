"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateFieldPayload,
  fieldService,
  UpdateFieldPayload,
} from "@/app/services/field.service";
import { ApiError } from "@/app/lib/axios";
import { Field } from "@/app/types/models";

export const fieldsQueryKey = (listId: string) => ["fields", listId] as const;

export function useFields(listId: string) {
  return useQuery({
    queryKey: fieldsQueryKey(listId),
    queryFn: () => fieldService.getFieldsByList(listId),
    enabled: Boolean(listId),
  });
}

export function useCreateField(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<Field, ApiError, Omit<CreateFieldPayload, "listId">>({
    mutationFn: (payload) => fieldService.createField({ ...payload, listId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fieldsQueryKey(listId) });
    },
  });
}

/** `fieldId` is passed per-call since callers act on whichever field the
 * user is editing, not a single fixed field. */
export function useUpdateField(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    Field,
    ApiError,
    { fieldId: string; payload: UpdateFieldPayload }
  >({
    mutationFn: ({ fieldId, payload }) =>
      fieldService.updateField(fieldId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fieldsQueryKey(listId) });
    },
  });
}

export function useDeleteField(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<Field, ApiError, string>({
    mutationFn: (fieldId) => fieldService.deleteField(fieldId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fieldsQueryKey(listId) });
    },
  });
}
