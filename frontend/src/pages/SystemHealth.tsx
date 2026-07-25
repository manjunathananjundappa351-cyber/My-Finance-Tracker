import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Alert, Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { systemApi } from "@/api/systemApi";
import { StatCardsSkeleton } from "@/components/Skeletons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ApplicationHealth } from "@/types/system";

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function SystemHealth() {
  useDocumentTitle("System Health");
  const [health, setHealth] = useState<ApplicationHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    systemApi
      .health()
      .then(setHealth)
      .catch(() => setError("Could not load application health."));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!health) return <StatCardsSkeleton count={4} />;

  const isHealthy = health.status === "ok";

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
        System Health
      </Typography>

      <Alert severity={isHealthy ? "success" : "error"} icon={isHealthy ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}>
        {isHealthy ? "All systems operational." : "The application is degraded."}
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Database
              </Typography>
              <Typography variant="h6" fontWeight={700} color={health.database_connected ? "success.main" : "error.main"}>
                {health.database_connected ? "Connected" : "Disconnected"}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                API Version
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {health.api_version}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Environment
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ textTransform: "capitalize" }}>
                {health.environment}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Storage Used
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatBytes(health.database_size_bytes)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
