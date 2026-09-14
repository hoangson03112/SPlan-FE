"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/app/services/workspace.service";
import { ApiError } from "@/app/lib/axios";
import { MemberRole, Workspace, WorkspaceMember } from "@/app/types/models";

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

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: (email) => workspaceService.inviteMember(workspaceId, email),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    WorkspaceMember,
    ApiError,
    { userId: string; role: MemberRole }
  >({
    mutationFn: ({ userId, role }) =>
      workspaceService.updateMemberRole(workspaceId, userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceMember, ApiError, string>({
    mutationFn: (userId) => workspaceService.removeMember(workspaceId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}

export function useLeaveWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceMember, ApiError, string>({
    mutationFn: (workspaceId) => workspaceService.leaveWorkspace(workspaceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey });
    },
  });
}
