import { apiClient } from "@/app/lib/axios";
import { Status, StatusGroup } from "@/app/types/models";

export interface CreateStatusPayload {
  listId: string;
  name: string;
  color?: string;
  group?: StatusGroup;
  position?: number;
}

export type UpdateStatusPayload = Partial<Omit<CreateStatusPayload, "listId">>;

export const statusService = {
  async createStatus(payload: CreateStatusPayload) {
    const res = await apiClient.post<Status>("/statuses", payload);
    return res.data;
  },

  async getStatusesByList(listId: string) {
    const res = await apiClient.get<Status[]>("/statuses", {
      params: { listId },
    });
    return res.data;
  },

  async updateStatus(statusId: string, payload: UpdateStatusPayload) {
    const res = await apiClient.patch<Status>(
      `/statuses/${statusId}`,
      payload,
    );
    return res.data;
  },

  async deleteStatus(statusId: string) {
    const res = await apiClient.delete<Status>(`/statuses/${statusId}`);
    return res.data;
  },
};
