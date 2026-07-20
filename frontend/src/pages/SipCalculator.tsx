import { Box, Grid, Paper, Slider, Stack, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { BarChart } from "@/components/charts/BarChart";
import { StatCard } from "@/components/StatCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatCurrency } from "@/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

function projectSip(monthly: number, annualRatePct: number, years: number) {
  const monthlyRate = annualRatePct / 100 / 12;
  const points: { year: number; invested: number; value: number }[] = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;
    const invested = monthly * months;
    const value =
      monthlyRate === 0
        ? invested
        : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    points.push({ year, invested, value });
  }

  return points;
}

export function SipCalculator() {
  useDocumentTitle("SIP Calculator");

  const [monthly, setMonthly] = useState(10000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(15);

  const points = useMemo(() => projectSip(monthly, annualRate, years), [monthly, annualRate, years]);
  const final = points[points.length - 1];
  const totalInvested = final?.invested ?? 0;
  const totalValue = final?.value ?? 0;
  const estimatedReturns = totalValue - totalInvested;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
        SIP Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={-2}>
        Estimate the future value of a monthly Systematic Investment Plan. This is a projection
        based on a constant assumed return, not a guarantee of actual returns.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            variant="outlined"
            sx={{ p: 3 }}
          >
            <Stack spacing={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Monthly Investment</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(monthly)}
                  </Typography>
                </Stack>
                <Slider
                  value={monthly}
                  onChange={(_, v) => setMonthly(v as number)}
                  min={500}
                  max={200000}
                  step={500}
                />
                <TextField
                  size="small"
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  fullWidth
                />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Expected Annual Return</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {annualRate}%
                  </Typography>
                </Stack>
                <Slider
                  value={annualRate}
                  onChange={(_, v) => setAnnualRate(v as number)}
                  min={1}
                  max={30}
                  step={0.5}
                />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Duration</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {years} years
                  </Typography>
                </Stack>
                <Slider value={years} onChange={(_, v) => setYears(v as number)} min={1} max={30} step={1} />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <StatCard label="Total Invested" value={totalInvested} format={formatCurrency} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard
                  label="Estimated Returns"
                  value={estimatedReturns}
                  format={formatCurrency}
                  positive
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard label="Future Value" value={totalValue} format={formatCurrency} />
              </Grid>
            </Grid>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <BarChart
                title="Growth Over Time"
                categories={points.map((p) => `Yr ${p.year}`)}
                series={[
                  { name: "Invested", data: points.map((p) => Math.round(p.invested)) },
                  { name: "Value", data: points.map((p) => Math.round(p.value)) },
                ]}
              />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
