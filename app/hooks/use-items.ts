"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateItemPayload,
  itemService,
  UpdateItemPayload,
} from "@/app/services/item.service";
import { ApiError } from "@/app/lib/axios";
import { Item } from "@/app/types/models";

export const itemsQueryKey = (listId: string) => ["items", listId] as const;

export function useItems(listId: string) {
  return useQuery({
    queryKey: itemsQueryKey(listId),
    queryFn: () => itemService.getItemsByList(listId),
    enabled: Boolean(listId),
  });
}

export function useCreateItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<Item, ApiError, Omit<CreateItemPayload, "listId">>({
    mutationFn: (payload) => itemService.createItem({ ...payload, listId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(listId) });
    },
  });
}

/** `itemId` is passed per-call since callers act on whichever task the user
 * clicked, not a single fixed task. */
export function useUpdateItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    Item,
    ApiError,
    { itemId: string; payload: UpdateItemPayload }
  >({
    mutationFn: ({ itemId, payload }) => itemService.updateItem(itemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(listId) });
    },
  });
}

export function useDeleteItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation<Item, ApiError, string>({
    mutationFn: (itemId) => itemService.deleteItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(listId) });
    },
  });
}
