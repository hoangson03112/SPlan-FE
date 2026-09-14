import { apiClient } from "@/app/lib/axios";
import { Item } from "@/app/types/models";

export interface CreateItemPayload {
  listId: string;
  title?: string;
  data?: Record<string, unknown>;
  statusId?: string;
  kanbanOrder?: number;
  tableOrder?: number;
}

export type UpdateItemPayload = Partial<Omit<CreateItemPayload, "listId">>;

export const itemService = {
  async createItem(payload: CreateItemPayload) {
    const res = await apiClient.post<Item>("/items", payload);
    return res.data;
  },

  async getItemsByList(listId: string, params?: { take?: number; skip?: number }) {
    const res = await apiClient.get<{ items: Item[]; total: number | null }>(
      "/items",
      { params: { listId, ...params } },
    );
    return res.data;
  },

  async updateItem(itemId: string, payload: UpdateItemPayload) {
    const res = await apiClient.patch<Item>(`/items/${itemId}`, payload);
    return res.data;
  },

  async deleteItem(itemId: string) {
    const res = await apiClient.delete<Item>(`/items/${itemId}`);
    return res.data;
  },
};
