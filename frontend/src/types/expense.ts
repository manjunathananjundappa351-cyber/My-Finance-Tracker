import { Tag } from "@/types/tag";

export type ExpenseType = "need" | "want";

export interface ExpenseCategory {
  id: number;
  name: string;
  type: ExpenseType;
  is_default: boolean;
}

export interface Expense {
  id: number;
  category: ExpenseCategory;
  amount: number;
  description: string;
  notes: string;
  expense_date: string;
  is_recurring: boolean;
  is_archived: boolean;
  recurring_parent_id: number | null;
  tags: Tag[];
  goal_id: number | null;
}

export interface ExpenseCreatePayload {
  category_id: number;
  amount: number;
  description: string;
  notes?: string;
  expense_date: string;
  is_recurring?: boolean;
  tag_ids?: number[];
  goal_id?: number | null;
  clear_goal?: boolean;
}

export interface ExpenseImportItem {
  category_name: string;
  amount: number;
  description?: string;
  expense_date: string;
}

export interface ExpenseBulkImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}
