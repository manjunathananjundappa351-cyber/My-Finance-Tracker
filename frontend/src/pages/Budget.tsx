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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { budgetApi } from "@/api/budgetApi";
import { expenseApi } from "@/api/expenseApi";
import { LoadingButton } from "@/components/LoadingButton";
import { StatCardsSkeleton } from "@/components/Skeletons";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { Budget as BudgetType } from "@/types/budget";
import { ExpenseCategory } from "@/types/expense";
import { formatCurrency } from "@/utils/format";

function progressColor(percent: number): "success" | "warning" | "error" {
  if (percent >= 100) return "error";
  if (percent >= 80) return "warning";
  return "success";
}

export function Budget() {
  useDocumentTitle("Budget");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [budgets, setBudgets] = useState<BudgetType[] | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetType | null>(null);
  const [saving, setSaving] = useState(false);

  const [categoryId, setCategoryId] = useState<number | "">("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  function loadData() {
    Promise.all([budgetApi.list(), expenseApi.listCategories()])
      .then(([budgetList, categoryList]) => {
        setBudgets(budgetList);
        setCategories(categoryList);
      })
      .catch(() => setError("Could not load budgets."));
  }

  useEffect(loadData, []);

  const availableCategories = useMemo(() => {
    if (editing) return categories;
    const budgeted = new Set((budgets ?? []).map((b) => b.category.id));
    return categories.filter((c) => !budgeted.has(c.id));
  }, [categories, budgets, editing]);

  function openCreate() {
    setEditing(null);
    setCategoryId("");
    setMonthlyLimit("");
    setDialogOpen(true);
  }

  function openEdit(budget: BudgetType) {
    setEditing(budget);
    setCategoryId(budget.category.id);
    setMonthlyLimit(String(budget.monthly_limit));
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!monthlyLimit) return;
    setSaving(true);
    try {
      if (editing) {
        await budgetApi.update(editing.id, parseFloat(monthlyLimit));
        toast.success("Budget updated");
      } else {
        if (categoryId === "") return;
        await budgetApi.create({ category_id: categoryId, monthly_limit: parseFloat(monthlyLimit) });
        toast.success("Budget created");
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save budget"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(budget: BudgetType) {
    const ok = await confirm("Delete budget?", `Remove the ${budget.category.name} budget?`);
    if (!ok) return;
    try {
      await budgetApi.remove(budget.id);
      toast.success("Budget deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete budget"));
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!budgets) return <StatCardsSkeleton count={3} />;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Budget
        </Typography>
        <LoadingButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Budget
        </LoadingButton>
      </Box>

      {budgets.length === 0 ? (
        <Alert severity="info">
          No budgets set yet. Add one to track spending against a monthly limit per category.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {budgets.map((b, i) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
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
                      {b.category.name}
                    </Typography>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => openEdit(b)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(b)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {formatCurrency(b.spent)} of {formatCurrency(b.monthly_limit)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(b.percent_used, 100)}
                    color={progressColor(b.percent_used)}
                    sx={{ height: 8, borderRadius: 4, mt: 1.5, mb: 0.5 }}
                  />
                  <Typography
                    variant="caption"
                    color={progressColor(b.percent_used) === "success" ? "text.secondary" : `${progressColor(b.percent_used)}.main`}
                  >
                    {b.percent_used.toFixed(0)}% used
                    {b.remaining >= 0
                      ? ` · ${formatCurrency(b.remaining)} remaining`
                      : ` · ${formatCurrency(Math.abs(b.remaining))} over`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Budget" : "Add Budget"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            disabled={Boolean(editing)}
            fullWidth
          >
            {availableCategories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Monthly Limit"
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
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
