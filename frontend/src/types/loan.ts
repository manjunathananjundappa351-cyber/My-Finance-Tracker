export type LoanType = "home" | "car" | "education" | "personal" | "other";

export interface Loan {
  id: number;
  name: string;
  loan_type: LoanType;
  principal_amount: number;
  interest_rate: number;
  emi_amount: number;
  outstanding_balance: number;
  start_date: string;
  tenure_months: number;
  notes: string;
  is_archived: boolean;
  paid_amount: number;
  progress_pct: number;
  next_due_date: string;
}

export interface LoanCreatePayload {
  name: string;
  loan_type: LoanType;
  principal_amount: number;
  interest_rate: number;
  emi_amount: number;
  outstanding_balance: number;
  start_date: string;
  tenure_months: number;
  notes?: string;
}
