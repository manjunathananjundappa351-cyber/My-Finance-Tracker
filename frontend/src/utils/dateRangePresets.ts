export type DatePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "this_quarter"
  | "last_quarter"
  | "financial_year"
  | "custom";

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
  this_month: "This Month",
  this_quarter: "This Quarter",
  last_quarter: "Last Quarter",
  financial_year: "Financial Year",
  custom: "Custom Date",
};

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7; // week starts Monday
  const result = new Date(d);
  result.setDate(d.getDate() - diff);
  return result;
}

export function resolvePreset(preset: DatePreset): { startDate: string; endDate: string } | null {
  const now = new Date();

  switch (preset) {
    case "today":
      return { startDate: toIso(now), endDate: toIso(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { startDate: toIso(y), endDate: toIso(y) };
    }
    case "this_week":
      return { startDate: toIso(startOfWeek(now)), endDate: toIso(now) };
    case "this_month":
      return {
        startDate: toIso(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: toIso(now),
      };
    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3);
      return {
        startDate: toIso(new Date(now.getFullYear(), q * 3, 1)),
        endDate: toIso(now),
      };
    }
    case "last_quarter": {
      const q = Math.floor(now.getMonth() / 3) - 1;
      const year = q < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const quarter = (q + 4) % 4;
      return {
        startDate: toIso(new Date(year, quarter * 3, 1)),
        endDate: toIso(new Date(year, quarter * 3 + 3, 0)),
      };
    }
    case "financial_year": {
      // Indian FY: April 1 - March 31
      const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return {
        startDate: toIso(new Date(fyStartYear, 3, 1)),
        endDate: toIso(new Date(fyStartYear + 1, 2, 31)),
      };
    }
    case "custom":
    default:
      return null;
  }
}
