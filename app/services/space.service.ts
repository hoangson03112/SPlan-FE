import { apiClient } from "@/app/lib/axios";
import { Space } from "@/app/types/models";

export interface CreateSpacePayload {
  workspaceId: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  category?: string;
}

export type UpdateSpacePayload = Partial<
  Omit<CreateSpacePayload, "workspaceId">
>;

export const spaceService = {
  async createSpace(payload: CreateSpacePayload) {
    const res = await apiClient.post<Space>("/spaces", payload);
    return res.data;
  },

  async getSpacesByWorkspace(workspaceId: string) {
    const res = await apiClient.get<Space[]>("/spaces", {
      params: { workspaceId },
    });
    return res.data;
  },

  async getSpaceById(spaceId: string) {
    const res = await apiClient.get<Space>(`/spaces/${spaceId}`);
    return res.data;
  },

  async updateSpace(spaceId: string, payload: UpdateSpacePayload) {
    const res = await apiClient.patch<Space>(`/spaces/${spaceId}`, payload);
    return res.data;
  },

  async deleteSpace(spaceId: string) {
    const res = await apiClient.delete<Space>(`/spaces/${spaceId}`);
    return res.data;
  },
};
