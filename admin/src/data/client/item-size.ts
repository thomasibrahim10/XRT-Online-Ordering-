import { HttpClient } from './http-client';

export interface ItemSize {
  id: string;
  item_id: string;
  business_id: string;
  name: string;
  code: string;
  price: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateItemSizeInput {
  business_id: string;
  name: string;
  code: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateItemSizeInput {
  name?: string;
  code?: string;
  price?: number;
  display_order?: number;
  is_active?: boolean;
}

export const itemSizeClient = {
  getAll: async (businessId?: string) => {
    const response = await HttpClient.get<{ success: boolean; data: ItemSize[] }>(
      `sizes`,
      businessId ? { business_id: businessId, is_active: true } : { is_active: true }
    );
    return response?.data || response || [];
  },

  get: async (id: string) => {
    const response = await HttpClient.get<{ success: boolean; data: ItemSize }>(
      `sizes/${id}`
    );
    return response;
  },

  create: async (input: CreateItemSizeInput) => {
    const response = await HttpClient.post<{ success: boolean; data: ItemSize }>(
      `sizes`,
      input
    );
    return response;
  },

  update: async (id: string, input: UpdateItemSizeInput) => {
    const response = await HttpClient.put<{ success: boolean; data: ItemSize }>(
      `sizes/${id}`,
      input
    );
    return response;
  },

  delete: async (id: string) => {
    const response = await HttpClient.delete<{ success: boolean }>(
      `sizes/${id}`
    );
    return response;
  },
};
