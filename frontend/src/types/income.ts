import { Tag } from "@/types/tag";

export interface IncomeCategory {
  id: number;
  name: string;
  is_default: boolean;
}

export interface Income {
  id: number;
  category: IncomeCategory;
  amount: number;
  description: string;
  notes: string;
  income_date: string;
  is_recurring: boolean;
  is_archived: boolean;
  recurring_parent_id: number | null;
  tags: Tag[];
}

export interface IncomeCreatePayload {
  category_id: number;
  amount: number;
  description: string;
  notes?: string;
  income_date: string;
  is_recurring?: boolean;
  tag_ids?: number[];
}
