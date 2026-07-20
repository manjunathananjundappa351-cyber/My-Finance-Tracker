import { Card, CardContent, Grid, Paper, Skeleton, Stack } from "@mui/material";

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={12 / count} key={i}>
          <Card variant="outlined">
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={40} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={36} />
        ))}
      </Stack>
    </Paper>
  );
}

export function ChartSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={280} />
    </Paper>
  );
}

export function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Skeleton variant="text" width={280} height={44} />
        <Skeleton variant="text" width={200} />
      </Stack>
      <StatCardsSkeleton count={4} />
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <ChartSkeleton />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
