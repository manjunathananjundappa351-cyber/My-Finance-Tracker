export interface NetWorthPoint {
  snapshot_date: string;
  net_worth: number;
}

export interface NetWorthTimeline {
  points: NetWorthPoint[];
}
