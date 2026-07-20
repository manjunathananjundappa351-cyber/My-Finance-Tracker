export type AssetType =
  | "stock"
  | "etf"
  | "mutual_fund"
  | "gold"
  | "silver"
  | "fd"
  | "ppf"
  | "nps"
  | "crypto"
  | "bond";

export interface PortfolioHolding {
  id: number;
  symbol: string;
  name: string;
  asset_type: AssetType;
  quantity: number;
  buy_price: number;
  buy_date: string;
  current_price: number;
  broker: string;
  sector: string;
  exchange: string;
  target_price: number | null;
  stop_loss: number | null;
  notes: string;
  is_archived: boolean;
  invested_value: number;
  current_value: number;
  profit_loss: number;
  profit_loss_pct: number;
  cagr_pct: number | null;
}

export interface PortfolioHoldingCreatePayload {
  symbol: string;
  name?: string;
  asset_type: AssetType;
  quantity: number;
  buy_price: number;
  buy_date: string;
  current_price: number;
  broker?: string;
  sector?: string;
  exchange?: string;
  target_price?: number | null;
  stop_loss?: number | null;
  notes?: string;
}
