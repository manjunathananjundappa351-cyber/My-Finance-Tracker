import { PaletteMode } from "@mui/material";

export function getChartTheme(mode: PaletteMode) {
  const isDark = mode === "dark";
  return {
    backgroundColor: "transparent",
    textColor: isDark ? "#f5f5f7" : "#1d1d1f",
    secondaryTextColor: isDark ? "rgba(245,245,247,0.65)" : "#6e6e73",
    splitLineColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    axisLineColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)",
    borderColor: isDark ? "#1d1d1f" : "#ffffff",
    tooltip: {
      backgroundColor: isDark ? "#2c2c2e" : "#ffffff",
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      textStyle: { color: isDark ? "#f5f5f7" : "#1d1d1f" },
    },
  };
}
