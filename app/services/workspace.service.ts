import { apiClient } from "@/app/lib/axios";
import { Workspace, WorkspaceMemberWithUser } from "@/app/types/models";

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
};
