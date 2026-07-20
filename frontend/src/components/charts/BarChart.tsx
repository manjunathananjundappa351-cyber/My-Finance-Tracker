import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface BarChartProps {
  title?: string;
  categories: string[];
  series: { name: string; data: number[] }[];
}

export function BarChart({ title, categories, series }: BarChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title ? { text: title, textStyle: { fontSize: 14, color: ct.textColor } } : undefined,
    tooltip: { trigger: "axis", ...ct.tooltip },
    legend: series.length > 1 ? { top: 0, textStyle: { color: ct.secondaryTextColor } } : undefined,
    grid: { left: 48, right: 16, top: series.length > 1 ? 40 : 32, bottom: 32 },
    xAxis: {
      type: "category",
      data: categories,
      axisLine: { lineStyle: { color: ct.axisLineColor } },
      axisLabel: { color: ct.secondaryTextColor },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: ct.splitLineColor } },
      axisLabel: { color: ct.secondaryTextColor },
    },
    series: series.map((s) => ({
      name: s.name,
      type: "bar",
      data: s.data,
    })),
  };

  return <ReactECharts option={option} style={{ height: 320 }} notMerge />;
}
