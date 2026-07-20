import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { goalApi } from "@/api/goalApi";
import { LoadingButton } from "@/components/LoadingButton";
import { StatCardsSkeleton } from "@/components/Skeletons";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { Goal } from "@/types/goal";
import { formatCurrency } from "@/utils/format";

export function Goals() {
  useDocumentTitle("Goals");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  function loadData() {
    goalApi
      .list()
      .then(setGoals)
      .catch(() => setError("Could not load goals."));
  }

  useEffect(loadData, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
    setDialogOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditing(goal);
    setName(goal.name);
    setTargetAmount(String(goal.target_amount));
    setCurrentAmount(String(goal.current_amount));
    setTargetDate(goal.target_date);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name || !targetAmount || !targetDate) return;
    setSaving(true);
    try {
      const payload = {
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || "0"),
        target_date: targetDate,
      };
      if (editing) {
        await goalApi.update(editing.id, payload);
        toast.success("Goal updated");
      } else {
        await goalApi.create(payload);
        toast.success("Goal created");
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save goal"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(goal: Goal) {
    const ok = await confirm("Delete goal?", `Remove "${goal.name}"?`);
    if (!ok) return;
    try {
      await goalApi.remove(goal.id);
      toast.success("Goal deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete goal"));
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!goals) return <StatCardsSkeleton count={3} />;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Goals
        </Typography>
        <LoadingButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Goal
        </LoadingButton>
      </Box>

      {goals.length === 0 ? (
        <Alert severity="info">
          No goals yet. Add one — e.g. an emergency fund or a house down payment — to track
          progress toward it.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {goals.map((g, i) => (
            <Grid item xs={12} sm={6} md={4} key={g.id}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                variant="outlined"
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {g.name}
                    </Typography>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => openEdit(g)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(g)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {formatCurrency(g.current_amount)} of {formatCurrency(g.target_amount)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(g.progress_pct, 100)}
                    sx={{ height: 8, borderRadius: 4, mt: 1.5, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {g.progress_pct.toFixed(0)}% funded · target {g.target_date}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} mt={1}>
                    {g.months_remaining > 0
                      ? `${formatCurrency(g.monthly_contribution_needed)}/mo needed`
                      : "Target date reached"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Goal" : "Add Goal"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            label="Target Amount"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            fullWidth
          />
          <TextField
            label="Current Amount"
            type="number"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            fullWidth
          />
          <TextField
            label="Target Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <LoadingButton variant="contained" loading={saving} onClick={handleSave}>
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {ConfirmDialog}
    </Box>
  );
}
