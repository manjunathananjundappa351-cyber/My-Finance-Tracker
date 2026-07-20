export type TradeDirection = "long" | "short";

export interface Trade {
  id: number;
  symbol: string;
  direction: TradeDirection;
  quantity: number;
  entry_price: number;
  entry_date: string;
  exit_price: number | null;
  exit_date: string | null;
  strategy: string;
  emotion: string;
  mistake: string;
  lessons: string;
  is_closed: boolean;
  profit_loss: number | null;
  holding_days: number | null;
}

export interface TradeCreatePayload {
  symbol: string;
  direction: TradeDirection;
  quantity: number;
  entry_price: number;
  entry_date: string;
  exit_price?: number | null;
  exit_date?: string | null;
  strategy?: string;
  emotion?: string;
  mistake?: string;
  lessons?: string;
}

export interface TradeAnalytics {
  total_trades: number;
  closed_trades: number;
  win_rate_pct: number;
  total_profit_loss: number;
  average_profit_loss: number;
  best_trade: Trade | null;
  worst_trade: Trade | null;
  average_holding_days: number | null;
}
