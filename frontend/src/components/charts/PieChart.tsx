import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface PieChartProps {
  title?: string;
  data: { name: string; value: number }[];
}

export function PieChart({ title, data }: PieChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title
      ? { text: title, left: "center", textStyle: { fontSize: 14, color: ct.textColor } }
      : undefined,
    tooltip: { trigger: "item", ...ct.tooltip },
    legend: { bottom: 0, type: "scroll", textStyle: { color: ct.secondaryTextColor } },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: ct.borderColor, borderWidth: 2 },
        label: { show: false },
        data,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} notMerge />;
}
