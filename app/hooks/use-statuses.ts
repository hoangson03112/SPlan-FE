"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateStatusPayload,
  statusService,
  UpdateStatusPayload,
} from "@/app/services/status.service";
import { ApiError } from "@/app/lib/axios";
import { Status } from "@/app/types/models";

export const statusesQueryKey = (listId: string) =>
  ["statuses", listId] as const;

export function useStatuses(listId: string) {
  return useQuery({
    queryKey: statusesQueryKey(listId),
    queryFn: () => statusService.getStatusesByList(listId),
    enabled: Boolean(listId),
  });
}

export function useCreateStatus(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<Status, ApiError, Omit<CreateStatusPayload, "listId">>({
    mutationFn: (payload) =>
      statusService.createStatus({ ...payload, listId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statusesQueryKey(listId) });
    },
  });
}

/** `statusId` is passed per-call since callers act on whichever column the
 * user clicked, not a single fixed column. */
export function useUpdateStatus(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    Status,
    ApiError,
    { statusId: string; payload: UpdateStatusPayload }
  >({
    mutationFn: ({ statusId, payload }) =>
      statusService.updateStatus(statusId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statusesQueryKey(listId) });
    },
  });
}

export function useDeleteStatus(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<Status, ApiError, string>({
    mutationFn: (statusId) => statusService.deleteStatus(statusId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statusesQueryKey(listId) });
      // A deleted status nulls out any items pointing at it server-side.
      void queryClient.invalidateQueries({ queryKey: ["items", listId] });
    },
  });
}
