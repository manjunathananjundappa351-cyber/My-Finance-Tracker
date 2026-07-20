import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface TreemapNode {
  name: string;
  value: number;
  colorValue: number;
}

interface TreemapChartProps {
  title?: string;
  data: TreemapNode[];
}

export function TreemapChart({ title, data }: TreemapChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title ? { text: title, textStyle: { fontSize: 14, color: ct.textColor } } : undefined,
    tooltip: {
      ...ct.tooltip,
      formatter: (info: { name: string; value: number; data: TreemapNode }) =>
        `${info.name}<br/>Value: ${info.value.toLocaleString()}<br/>P&amp;L: ${info.data.colorValue.toFixed(1)}%`,
    },
    visualMap: {
      show: false,
      type: "continuous",
      min: -20,
      max: 20,
      dimension: 1,
      inRange: { color: ["#ff3b30", "#8e8e93", "#28cd41"] },
    },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: { color: "#fff", fontSize: 12, fontWeight: 600 },
        itemStyle: { borderColor: ct.borderColor, borderWidth: 2, gapWidth: 2 },
        data: data.map((d) => ({ name: d.name, value: [d.value, d.colorValue] })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} notMerge />;
}
