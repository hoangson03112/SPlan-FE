import { apiClient } from "@/app/lib/axios";
import {
  MemberRole,
  Workspace,
  WorkspaceMember,
  WorkspaceMemberWithUser,
} from "@/app/types/models";

export const workspaceService = {
  async createWorkspace(name: string) {
    const res = await apiClient.post<{ message: string; workspace: Workspace }>(
      "/workspace/create",
      { name },
    );
    return res.data.workspace;
  },

  async getMyWorkspaces() {
    const res = await apiClient.get<{ workspaces: Workspace[] }>(
      "/workspace/my-workspaces",
    );
    return res.data.workspaces;
  },

  async getMembers(workspaceId: string) {
    const res = await apiClient.get<WorkspaceMemberWithUser[]>(
      `/workspace/${workspaceId}/members`,
    );
    return res.data;
  },

  async inviteMember(workspaceId: string, email: string) {
    const res = await apiClient.post<{ message: string }>(
      "/workspace/invite-members",
      { workspaceId, email },
    );
    return res.data;
  },

  async updateMemberRole(workspaceId: string, userId: string, role: MemberRole) {
    const res = await apiClient.patch<WorkspaceMember>(
      `/workspace/${workspaceId}/members/${userId}`,
      { role },
    );
    return res.data;
  },

  async removeMember(workspaceId: string, userId: string) {
    const res = await apiClient.delete<WorkspaceMember>(
      `/workspace/${workspaceId}/members/${userId}`,
    );
    return res.data;
  },

  async leaveWorkspace(workspaceId: string) {
    const res = await apiClient.post<WorkspaceMember>(
      `/workspace/${workspaceId}/leave`,
    );
    return res.data;
  },
};
