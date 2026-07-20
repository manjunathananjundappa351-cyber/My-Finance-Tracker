export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  notes: string;
  is_archived: boolean;
  progress_pct: number;
  months_remaining: number;
  monthly_contribution_needed: number;
}

export interface GoalCreatePayload {
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  notes?: string;
}
