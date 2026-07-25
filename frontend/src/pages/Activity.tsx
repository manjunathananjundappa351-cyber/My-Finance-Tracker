import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import { Alert, Avatar, Box, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { auditLogApi } from "@/api/auditLogApi";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeletons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AuditLogEntry } from "@/types/auditLog";

const ACTION_ICON: Record<string, JSX.Element> = {
  create: <AddCircleOutlineIcon fontSize="small" />,
  update: <EditOutlinedIcon fontSize="small" />,
  archive: <ArchiveOutlinedIcon fontSize="small" />,
  restore: <RestoreIcon fontSize="small" />,
  delete: <DeleteForeverIcon fontSize="small" />,
};

const ACTION_COLOR: Record<string, string> = {
  create: "success.main",
  update: "info.main",
  archive: "warning.main",
  restore: "success.main",
  delete: "error.main",
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function Activity() {
  useDocumentTitle("Activity");
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auditLogApi
      .list()
      .then(setEntries)
      .catch(() => setError("Could not load activity."));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!entries) return <TableSkeleton />;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
        Activity
      </Typography>

      {entries.length === 0 ? (
        <EmptyState
          icon={<HistoryOutlinedIcon />}
          title="No activity yet"
          description="Every change you make - adding, editing, archiving, deleting - shows up here."
        />
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box display="flex" flexDirection="column" gap={0}>
            {entries.map((entry, i) => (
              <Box
                key={entry.id}
                display="flex"
                gap={2}
                py={1.5}
                sx={{
                  borderBottom: i < entries.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "transparent",
                    color: ACTION_COLOR[entry.action] ?? "text.secondary",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {ACTION_ICON[entry.action] ?? <EditOutlinedIcon fontSize="small" />}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography variant="body2">{entry.summary}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(entry.created_at)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
