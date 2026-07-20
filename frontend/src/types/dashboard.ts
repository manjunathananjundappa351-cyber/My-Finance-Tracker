export interface MonthlyAmount {
  month: string;
  amount: number;
}

export interface CategoryAllocation {
  label: string;
  amount: number;
}

export interface HoldingMover {
  symbol: string;
  name: string;
  profit_loss: number;
  profit_loss_pct: number;
}

export interface DashboardSummary {
  net_worth: number;
  total_invested: number;
  total_portfolio_value: number;
  monthly_income: number;
  monthly_expenses: number;
  todays_profit_loss: number;
  expense_trend: MonthlyAmount[];
  income_trend: MonthlyAmount[];
  cash_flow: MonthlyAmount[];
  expense_allocation: CategoryAllocation[];
  portfolio_allocation: CategoryAllocation[];
  top_gainers: HoldingMover[];
  top_losers: HoldingMover[];
}
