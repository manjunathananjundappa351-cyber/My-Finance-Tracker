import { ReactNode, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

import { dashboardApi } from "@/api/dashboardApi";
import { gamificationApi } from "@/api/gamificationApi";
import { healthScoreApi } from "@/api/healthScoreApi";
import { netWorthApi } from "@/api/netWorthApi";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { SankeyChart } from "@/components/charts/SankeyChart";
import { GamificationBadges } from "@/components/GamificationBadges";
import { HealthScoreCard } from "@/components/HealthScoreCard";
import { DashboardSkeleton } from "@/components/Skeletons";
import { StatCard } from "@/components/StatCard";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DashboardSummary } from "@/types/dashboard";
import { FinancialHealthScore } from "@/types/healthScore";
import { GamificationStats } from "@/types/gamification";
import { NetWorthPoint } from "@/types/netWorth";
import { formatCurrency, formatPercent } from "@/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function MotionPaper({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      variant="outlined"
      sx={{ p: 2 }}
    >
      {children}
    </Paper>
  );
}

function buildCashFlowSankey(summary: DashboardSummary) {
  const nodes = new Set<string>(["Income", "Expenses", "Savings"]);
  const links: { source: string; target: string; value: number }[] = [];

  if (summary.monthly_expenses > 0) {
    links.push({ source: "Income", target: "Expenses", value: summary.monthly_expenses });
  }
  const savings = Math.max(summary.monthly_income - summary.monthly_expenses, 0);
  if (savings > 0) {
    links.push({ source: "Income", target: "Savings", value: savings });
  }
  for (const c of summary.expense_allocation) {
    if (c.amount <= 0) continue;
    nodes.add(c.label);
    links.push({ source: "Expenses", target: c.label, value: c.amount });
  }

  return { nodes: Array.from(nodes), links };
}

export function Dashboard() {
  useDocumentTitle("Dashboard");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [gamification, setGamification] = useState<GamificationStats | null>(null);
  const [netWorthTimeline, setNetWorthTimeline] = useState<NetWorthPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    Promise.all([
      dashboardApi.getSummary(),
      healthScoreApi.get(),
      gamificationApi.get(),
      netWorthApi.timeline(),
    ])
      .then(([summaryData, healthData, gamificationData, timeline]) => {
        setSummary(summaryData);
        setHealthScore(healthData);
        setGamification(gamificationData);
        setNetWorthTimeline(timeline.points);
      })
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!summary || !healthScore || !gamification || !netWorthTimeline) return <DashboardSkeleton />;

  const firstName = user?.full_name?.split(" ")[0];
  const sankey = buildCashFlowSankey(summary);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ""}.
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={0.5}>
          Here&apos;s where your money stands today.
        </Typography>
      </Box>

      <GamificationBadges stats={gamification} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Net Worth" value={summary.net_worth} format={formatCurrency} delay={0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Today's Profit/Loss"
            value={summary.todays_profit_loss}
            format={formatCurrency}
            positive={summary.todays_profit_loss >= 0}
            delay={0.08}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Monthly Income"
            value={summary.monthly_income}
            format={formatCurrency}
            delay={0.16}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Monthly Expenses"
            value={summary.monthly_expenses}
            format={formatCurrency}
            delay={0.24}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <MotionPaper delay={0.06}>
            <LineChart
              title="Net Worth Over Time"
              categories={netWorthTimeline.map((p) => p.snapshot_date)}
              series={[{ name: "Net worth", data: netWorthTimeline.map((p) => p.net_worth) }]}
            />
          </MotionPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box component={motion.div} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }}>
            <HealthScoreCard data={healthScore} />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <MotionPaper delay={0.1}>
            <LineChart
              title="Cash Flow (last 6 months)"
              categories={summary.cash_flow.map((c) => c.month)}
              series={[{ name: "Net cash flow", data: summary.cash_flow.map((c) => c.amount) }]}
            />
          </MotionPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionPaper delay={0.16}>
            <BarChart
              title="Expense vs Income Trend"
              categories={summary.expense_trend.map((c) => c.month)}
              series={[
                { name: "Expenses", data: summary.expense_trend.map((c) => c.amount) },
                { name: "Income", data: summary.income_trend.map((c) => c.amount) },
              ]}
            />
          </MotionPaper>
        </Grid>
        {sankey.links.length > 0 && (
          <Grid item xs={12}>
            <MotionPaper delay={0.2}>
              <SankeyChart title="Cash Flow Breakdown (this month)" nodes={sankey.nodes} links={sankey.links} />
            </MotionPaper>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <MotionPaper delay={0.22}>
            <PieChart
              title="Expense Allocation (this month)"
              data={summary.expense_allocation.map((c) => ({ name: c.label, value: c.amount }))}
            />
          </MotionPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionPaper delay={0.28}>
            <PieChart
              title="Portfolio Allocation"
              data={summary.portfolio_allocation.map((c) => ({ name: c.label, value: c.amount }))}
            />
          </MotionPaper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <MotionPaper delay={0.32}>
            <MoversTable title="Top Gainers" movers={summary.top_gainers} />
          </MotionPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionPaper delay={0.36}>
            <MoversTable title="Top Losers" movers={summary.top_losers} />
          </MotionPaper>
        </Grid>
      </Grid>
    </Box>
  );
}

function MoversTable({
  title,
  movers,
}: {
  title: string;
  movers: DashboardSummary["top_gainers"];
}) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        {title}
      </Typography>
      {movers.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No holdings yet.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell align="right">P&amp;L</TableCell>
              <TableCell align="right">P&amp;L %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movers.map((m) => (
              <TableRow key={m.symbol}>
                <TableCell>{m.symbol}</TableCell>
                <TableCell align="right">{formatCurrency(m.profit_loss)}</TableCell>
                <TableCell align="right">{formatPercent(m.profit_loss_pct)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
