import AddIcon from "@mui/icons-material/Add";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { goalApi } from "@/api/goalApi";
import { LoadingButton } from "@/components/LoadingButton";
import { StatCardsSkeleton } from "@/components/Skeletons";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { Goal, GoalTransactions } from "@/types/goal";
import { formatCurrency } from "@/utils/format";

type ViewMode = "active" | "archived";

export function Goals() {
  useDocumentTitle("Goals");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");

  const [transactionsGoal, setTransactionsGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<GoalTransactions | null>(null);

  function loadData() {
    goalApi
      .list({ archived_only: viewMode === "archived" })
      .then(setGoals)
      .catch(() => setError("Could not load goals."));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadData, [viewMode]);

  function openCreate() {
    setEditing(null);
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
    setNotes("");
    setDialogOpen(true);
  }

  useQuickAdd(openCreate);

  function openEdit(goal: Goal) {
    setEditing(goal);
    setName(goal.name);
    setTargetAmount(String(goal.target_amount));
    setCurrentAmount(String(goal.current_amount));
    setTargetDate(goal.target_date);
    setNotes(goal.notes);
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
        notes,
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

  async function handleArchive(goal: Goal) {
    try {
      await goalApi.archive(goal.id);
      toast.successWithUndo(`"${goal.name}" archived`, async () => {
        await goalApi.restore(goal.id);
        loadData();
      });
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not archive goal"));
    }
  }

  async function handleRestore(goal: Goal) {
    try {
      await goalApi.restore(goal.id);
      toast.success(`"${goal.name}" restored`);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore goal"));
    }
  }

  async function handleDeletePermanently(goal: Goal) {
    const ok = await confirm(
      "Delete permanently?",
      `Permanently delete "${goal.name}"? This can't be undone.`
    );
    if (!ok) return;
    try {
      await goalApi.remove(goal.id);
      toast.success("Goal permanently deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete goal"));
    }
  }

  function openTransactions(goal: Goal) {
    setTransactionsGoal(goal);
    setTransactions(null);
    goalApi
      .transactions(goal.id)
      .then(setTransactions)
      .catch(() => toast.error("Could not load linked transactions"));
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!goals) return <StatCardsSkeleton count={3} />;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Goals
        </Typography>
        <Box display="flex" gap={1}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, v) => v && setViewMode(v)}
          >
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="archived">Archived</ToggleButton>
          </ToggleButtonGroup>
          <LoadingButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Goal
          </LoadingButton>
        </Box>
      </Box>

      {goals.length === 0 ? (
        <Alert severity="info">
          {viewMode === "archived"
            ? "No archived goals."
            : "No goals yet. Add one — e.g. an emergency fund or a house down payment — to track progress toward it."}
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
                      {viewMode === "active" ? (
                        <>
                          <IconButton size="small" aria-label="Edit" onClick={() => openEdit(g)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" aria-label="Archive" onClick={() => handleArchive(g)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton size="small" aria-label="Restore" onClick={() => handleRestore(g)}>
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" aria-label="Delete permanently" onClick={() => handleDeletePermanently(g)}>
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
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
                  <Button
                    size="small"
                    startIcon={<ReceiptLongOutlinedIcon />}
                    onClick={() => openTransactions(g)}
                    sx={{ mt: 1 }}
                  >
                    Linked Transactions
                  </Button>
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
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
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
      <Dialog
        open={transactionsGoal !== null}
        onClose={() => setTransactionsGoal(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Linked Transactions — {transactionsGoal?.name}</DialogTitle>
        <DialogContent>
          {!transactions ? (
            <Typography color="text.secondary" py={2}>
              Loading…
            </Typography>
          ) : transactions.expenses.length === 0 && transactions.income.length === 0 ? (
            <Typography color="text.secondary" py={2}>
              No expenses or income linked to this goal yet.
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              {transactions.expenses.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                    Expenses
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.expenses.map((t) => (
                        <TableRow key={`e-${t.id}`}>
                          <TableCell>{t.txn_date}</TableCell>
                          <TableCell>{t.category_name}</TableCell>
                          <TableCell>{t.description}</TableCell>
                          <TableCell align="right">{formatCurrency(t.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
              {transactions.income.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                    Income
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.income.map((t) => (
                        <TableRow key={`i-${t.id}`}>
                          <TableCell>{t.txn_date}</TableCell>
                          <TableCell>{t.category_name}</TableCell>
                          <TableCell>{t.description}</TableCell>
                          <TableCell align="right">{formatCurrency(t.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionsGoal(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      {ConfirmDialog}
    </Box>
  );
}
