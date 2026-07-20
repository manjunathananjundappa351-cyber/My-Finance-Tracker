import { ExpenseCategory } from "@/types/expense";

export interface Budget {
  id: number;
  category: ExpenseCategory;
  monthly_limit: number;
  spent: number;
  remaining: number;
  percent_used: number;
}

export interface BudgetCreatePayload {
  category_id: number;
  monthly_limit: number;
}
