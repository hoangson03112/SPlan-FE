"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateSpacePayload,
  spaceService,
  UpdateSpacePayload,
} from "@/app/services/space.service";
import { ApiError } from "@/app/lib/axios";
import { Space } from "@/app/types/models";

export const spacesQueryKey = (workspaceId: string) =>
  ["spaces", workspaceId] as const;

export const spaceQueryKey = (spaceId: string) => ["space", spaceId] as const;

export function useSpaces(workspaceId: string) {
  return useQuery({
    queryKey: spacesQueryKey(workspaceId),
    queryFn: () => spaceService.getSpacesByWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useSpace(spaceId: string) {
  return useQuery({
    queryKey: spaceQueryKey(spaceId),
    queryFn: () => spaceService.getSpaceById(spaceId),
    enabled: Boolean(spaceId),
  });
}

export function useCreateSpace(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<Space, ApiError, Omit<CreateSpacePayload, "workspaceId">>({
    mutationFn: (payload) =>
      spaceService.createSpace({ ...payload, workspaceId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: spacesQueryKey(workspaceId),
      });
    },
  });
}

/** `spaceId` is passed per-call (not fixed per-hook) since callers operate on
 * whichever board is currently active, which can change between calls. */
export function useUpdateSpace(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    Space,
    ApiError,
    { spaceId: string; payload: UpdateSpacePayload }
  >({
    mutationFn: ({ spaceId, payload }) =>
      spaceService.updateSpace(spaceId, payload),
    onSuccess: (space) => {
      queryClient.setQueryData(spaceQueryKey(space.id), space);
      void queryClient.invalidateQueries({
        queryKey: spacesQueryKey(workspaceId),
      });
    },
  });
}

export function useDeleteSpace(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<Space, ApiError, string>({
    mutationFn: (spaceId) => spaceService.deleteSpace(spaceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: spacesQueryKey(workspaceId),
      });
    },
  });
}
