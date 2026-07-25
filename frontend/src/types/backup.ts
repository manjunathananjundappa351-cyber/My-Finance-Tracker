export interface BackupData {
  version: number;
  exported_at: string | null;
  tags: string[];
  expenses: unknown[];
  income: unknown[];
  portfolio_holdings: unknown[];
  loans: unknown[];
  goals: unknown[];
  budgets: unknown[];
}

export interface RestoreSummary {
  expenses_imported: number;
  income_imported: number;
  portfolio_holdings_imported: number;
  loans_imported: number;
  goals_imported: number;
  budgets_imported: number;
  tags_imported: number;
}
