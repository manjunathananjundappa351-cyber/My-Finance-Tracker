import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface RadarIndicator {
  name: string;
  max: number;
}

interface RadarSeriesItem {
  name: string;
  values: number[];
  color?: string;
}

interface RadarChartProps {
  title?: string;
  indicators: RadarIndicator[];
  series: RadarSeriesItem[];
}

export function RadarChart({ title, indicators, series }: RadarChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title
      ? { text: title, left: "center", textStyle: { fontSize: 14, color: ct.textColor } }
      : undefined,
    tooltip: { trigger: "item", ...ct.tooltip },
    legend: { bottom: 0, type: "scroll", textStyle: { color: ct.secondaryTextColor } },
    radar: {
      indicator: indicators,
      splitLine: { lineStyle: { color: ct.splitLineColor } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: ct.axisLineColor } },
      axisName: { color: ct.secondaryTextColor, fontSize: 11 },
    },
    series: [
      {
        type: "radar",
        data: series.map((s) => ({
          name: s.name,
          value: s.values,
          itemStyle: s.color ? { color: s.color } : undefined,
          areaStyle: { opacity: 0.15 },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 340 }} notMerge />;
}
