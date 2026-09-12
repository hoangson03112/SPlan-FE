"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/app/services/workspace.service";
import { ApiError } from "@/app/lib/axios";
import { Workspace } from "@/app/types/models";

export const workspacesQueryKey = ["workspaces"] as const;
export const workspaceMembersQueryKey = (workspaceId: string) =>
  ["workspace-members", workspaceId] as const;

export function useMyWorkspaces() {
  return useQuery({
    queryKey: workspacesQueryKey,
    queryFn: workspaceService.getMyWorkspaces,
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: workspaceMembersQueryKey(workspaceId),
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<Workspace, ApiError, string>({
    mutationFn: (name: string) => workspaceService.createWorkspace(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey });
    },
  });
}
