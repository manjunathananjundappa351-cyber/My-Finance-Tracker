export type StatusColor = "success" | "error" | "warning" | "info" | "default";

/** Green for profit, red for loss - the one color rule used across charts/tables. */
export function plColor(value: number): StatusColor {
  return value >= 0 ? "success" : "error";
}

/** Orange warning band vs red danger band, e.g. budget/loan utilization. */
export function thresholdColor(percentUsed: number): StatusColor {
  if (percentUsed >= 100) return "error";
  if (percentUsed >= 80) return "warning";
  return "success";
}

/** Blue = completed, gray = pending, used for goal/loan/trade lifecycle status. */
export function lifecycleColor(isComplete: boolean): StatusColor {
  return isComplete ? "info" : "default";
}
