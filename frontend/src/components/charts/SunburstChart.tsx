import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface SunburstNode {
  name: string;
  value?: number;
  children?: SunburstNode[];
  itemStyle?: { color?: string };
}

interface SunburstChartProps {
  title?: string;
  data: SunburstNode[];
}

export function SunburstChart({ title, data }: SunburstChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title
      ? { text: title, left: "center", textStyle: { fontSize: 14, color: ct.textColor } }
      : undefined,
    tooltip: {
      ...ct.tooltip,
      formatter: (info: { name: string; value: number }) =>
        `${info.name}<br/>₹${info.value.toLocaleString()}`,
    },
    series: [
      {
        type: "sunburst",
        radius: ["15%", "90%"],
        data,
        label: { color: "#fff", fontSize: 11, minAngle: 8 },
        itemStyle: { borderColor: ct.borderColor, borderWidth: 2 },
        levels: [
          {},
          { r0: "15%", r: "45%", itemStyle: { borderWidth: 2 } },
          { r0: "45%", r: "90%", label: { rotate: "tangential" } },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 380 }} notMerge />;
}
