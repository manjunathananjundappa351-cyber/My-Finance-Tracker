import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface BubblePoint {
  name: string;
  x: number;
  y: number;
  size: number;
  colorValue?: number;
}

interface BubbleChartProps {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  data: BubblePoint[];
}

export function BubbleChart({ title, xLabel, yLabel, data }: BubbleChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  const sizes = data.map((d) => d.size);
  const maxSize = Math.max(...sizes, 1);

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title ? { text: title, textStyle: { fontSize: 14, color: ct.textColor } } : undefined,
    tooltip: {
      ...ct.tooltip,
      formatter: (info: { data: BubblePoint }) =>
        `${info.data.name}<br/>${xLabel ?? "X"}: ${info.data.x.toLocaleString()}<br/>${
          yLabel ?? "Y"
        }: ${info.data.y.toLocaleString()}`,
    },
    grid: { left: 8, right: 24, top: 24, bottom: 32, containLabel: true },
    xAxis: {
      type: "value",
      name: xLabel,
      nameTextStyle: { color: ct.secondaryTextColor },
      splitLine: { lineStyle: { color: ct.splitLineColor } },
      axisLabel: { color: ct.secondaryTextColor },
    },
    yAxis: {
      type: "value",
      name: yLabel,
      nameTextStyle: { color: ct.secondaryTextColor },
      splitLine: { lineStyle: { color: ct.splitLineColor } },
      axisLabel: { color: ct.secondaryTextColor },
    },
    visualMap: {
      show: false,
      dimension: 3,
      min: Math.min(...data.map((d) => d.colorValue ?? 0), -1),
      max: Math.max(...data.map((d) => d.colorValue ?? 0), 1),
      inRange: { color: ["#ff3b30", "#8e8e93", "#28cd41"] },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (val: number[]) => 12 + (val[2] / maxSize) * 40,
        itemStyle: { opacity: 0.8, borderColor: ct.borderColor, borderWidth: 1 },
        label: {
          show: true,
          formatter: (info: { data: BubblePoint }) => info.data.name,
          position: "top",
          color: ct.secondaryTextColor,
          fontSize: 10,
        },
        data: data.map((d) => ({ name: d.name, value: [d.x, d.y, d.size, d.colorValue ?? 0] })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 340 }} notMerge />;
}
