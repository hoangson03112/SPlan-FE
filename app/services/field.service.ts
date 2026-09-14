import { apiClient } from "@/app/lib/axios";
import { Field, FieldType } from "@/app/types/models";

export interface CreateFieldPayload {
  listId: string;
  name: string;
  type: FieldType;
  config?: Record<string, unknown>;
  position?: number;
  isHidden?: boolean;
}

export type UpdateFieldPayload = Partial<Omit<CreateFieldPayload, "listId">>;

export const fieldService = {
  async createField(payload: CreateFieldPayload) {
    const res = await apiClient.post<Field>("/fields", payload);
    return res.data;
  },

  async getFieldsByList(listId: string) {
    const res = await apiClient.get<Field[]>("/fields", {
      params: { listId },
    });
    return res.data;
  },

  async updateField(fieldId: string, payload: UpdateFieldPayload) {
    const res = await apiClient.patch<Field>(`/fields/${fieldId}`, payload);
    return res.data;
  },

  async deleteField(fieldId: string) {
    const res = await apiClient.delete<Field>(`/fields/${fieldId}`);
    return res.data;
  },
};
