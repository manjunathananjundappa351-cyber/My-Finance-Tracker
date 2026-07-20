import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";

import { FinancialHealthScore } from "@/types/healthScore";

function ratingColor(rating: string): "success" | "info" | "warning" | "error" {
  if (rating === "Excellent") return "success";
  if (rating === "Good") return "info";
  if (rating === "Average") return "warning";
  return "error";
}

export function HealthScoreCard({ data }: { data: FinancialHealthScore }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Financial Health Score
        </Typography>
        <Typography variant="h5" fontWeight={700} color={`${ratingColor(data.overall_rating)}.main`}>
          {data.overall_score.toFixed(0)}
          <Typography component="span" variant="body2" color="text.secondary">
            {" "}
            /100 - {data.overall_rating}
          </Typography>
        </Typography>
      </Stack>
      <Stack spacing={1.5} mt={2}>
        {data.components.map((c) => (
          <Box key={c.label}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">{c.label}</Typography>
              <Typography variant="caption" color={`${ratingColor(c.rating)}.main`} fontWeight={600}>
                {c.rating}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(c.score, 100)}
              color={ratingColor(c.rating)}
              sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
            />
          </Box>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" mt={2}>
        A rule-based estimate from your savings rate, debt, diversification, budget adherence,
        and emergency fund coverage - not financial advice.
      </Typography>
    </Paper>
  );
}
