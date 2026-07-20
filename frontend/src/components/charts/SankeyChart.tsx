import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { getChartTheme } from "@/components/charts/chartTheme";

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyChartProps {
  title?: string;
  nodes: string[];
  links: SankeyLink[];
}

export function SankeyChart({ title, nodes, links }: SankeyChartProps) {
  const theme = useTheme();
  const ct = getChartTheme(theme.palette.mode);

  const option = {
    backgroundColor: ct.backgroundColor,
    title: title ? { text: title, textStyle: { fontSize: 14, color: ct.textColor } } : undefined,
    tooltip: { trigger: "item", triggerOn: "mousemove", ...ct.tooltip },
    series: [
      {
        type: "sankey",
        emphasis: { focus: "adjacency" },
        data: nodes.map((name) => ({ name })),
        links,
        label: { color: ct.textColor, fontSize: 11 },
        lineStyle: { color: "gradient", curveness: 0.5, opacity: 0.4 },
        nodeWidth: 16,
        nodeGap: 10,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 340 }} notMerge />;
}
