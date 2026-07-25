import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface WaterfallStep {
  name: string;
  value: number;
}

interface WaterfallChartProps {
  title?: string;
  steps: WaterfallStep[];
}

export function WaterfallChart({ title, steps }: WaterfallChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  let running = 0;
  const bases: number[] = [];
  const positives: (number | string)[] = [];
  const negatives: (number | string)[] = [];

  steps.forEach((step) => {
    if (step.value >= 0) {
      bases.push(running);
      positives.push(step.value);
      negatives.push("-");
      running += step.value;
    } else {
      running += step.value;
      bases.push(running);
      positives.push("-");
      negatives.push(-step.value);
    }
  });

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title ? { text: title, textStyle: { fontSize: 14, color: ct.textColor } } : undefined,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...ct.tooltip,
      formatter: (params: { name: string; seriesName: string; value: number | string }[]) => {
        const item = params.find((p) => p.value !== "-");
        if (!item) return "";
        return `${item.name}<br/>₹${Number(item.value).toLocaleString()}`;
      },
    },
    grid: { left: 8, right: 8, top: 32, bottom: 32, containLabel: true },
    xAxis: {
      type: "category",
      data: steps.map((s) => s.name),
      axisLine: { lineStyle: { color: ct.axisLineColor } },
      axisLabel: { color: ct.secondaryTextColor, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: ct.splitLineColor } },
      axisLabel: { color: ct.secondaryTextColor },
    },
    series: [
      {
        name: "Base",
        type: "bar",
        stack: "total",
        itemStyle: { color: "transparent" },
        emphasis: { itemStyle: { color: "transparent" } },
        data: bases,
        silent: true,
      },
      {
        name: "Increase",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#28cd41", borderRadius: 4 },
        data: positives,
      },
      {
        name: "Decrease",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#ff3b30", borderRadius: 4 },
        data: negatives,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} notMerge />;
}
