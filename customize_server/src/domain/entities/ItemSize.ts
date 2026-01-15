export interface ItemSize {
  id: string;
  business_id: string; // Global per business, NOT per item
  name: string;
  code: string; // Unique per business (e.g., 'S', 'M', 'L', 'XL')
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // Soft delete support
}

export interface CreateItemSizeDTO {
  business_id: string;
  name: string;
  code: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateItemSizeDTO {
  name?: string;
  code?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface ItemSizeFilters {
  business_id?: string;
  is_active?: boolean;
}
