import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import MicIcon from "@mui/icons-material/Mic";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RepeatIcon from "@mui/icons-material/Repeat";
import RestoreIcon from "@mui/icons-material/Restore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { expenseApi } from "@/api/expenseApi";
import { goalApi } from "@/api/goalApi";
import { PieChart } from "@/components/charts/PieChart";
import { SunburstChart } from "@/components/charts/SunburstChart";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { EmptyState } from "@/components/EmptyState";
import { ExportMenu } from "@/components/ExportMenu";
import { ImportExpensesDialog } from "@/components/ImportExpensesDialog";
import { LoadingButton } from "@/components/LoadingButton";
import { TableSkeleton } from "@/components/Skeletons";
import { TagsInput } from "@/components/TagsInput";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Expense, ExpenseCategory } from "@/types/expense";
import { Goal } from "@/types/goal";
import { Tag } from "@/types/tag";
import { formatCurrency } from "@/utils/format";
import { parseVoiceExpense } from "@/utils/parseVoiceExpense";

type SortField = "expense_date" | "amount" | "category";
type Order = "asc" | "desc";
type ViewMode = "active" | "archived";

type OptionalColumnKey = "category" | "tags" | "goal" | "notes";

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "tags", label: "Tags" },
  { key: "goal", label: "Goal" },
  { key: "notes", label: "Notes" },
];

const DEFAULT_COLUMN_PREFS: Record<OptionalColumnKey, boolean> = {
  category: true,
  tags: true,
  goal: true,
  notes: false,
};

export function Expenses() {
  useDocumentTitle("Expenses");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const voice = useVoiceInput();

  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  // sort + pagination
  const [orderBy, setOrderBy] = useState<SortField>("expense_date");
  const [order, setOrder] = useState<Order>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // bulk selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // column visibility (persisted)
  const [columnPrefs, setColumnPrefs] = useLocalStorage("expenses.columns", DEFAULT_COLUMN_PREFS);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);

  function toggleColumn(key: OptionalColumnKey) {
    setColumnPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // form fields
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [goalId, setGoalId] = useState<number | "">("");

  function loadData() {
    Promise.all([
      expenseApi.list({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category_id: filterCategoryId === "" ? undefined : filterCategoryId,
        archived_only: viewMode === "archived",
      }),
      categories.length ? Promise.resolve(categories) : expenseApi.listCategories(),
    ])
      .then(([expenseList, categoryList]) => {
        setExpenses(expenseList);
        setCategories(categoryList);
        setSelected(new Set());
      })
      .catch(() => setError("Could not load expenses."));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadData, [startDate, endDate, filterCategoryId, viewMode]);

  useEffect(() => {
    goalApi.list().then(setGoals).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    if (!expenses) return [];
    const q = search.trim().toLowerCase();
    const rows = q
      ? expenses.filter(
          (e) =>
            e.description.toLowerCase().includes(q) ||
            e.category.name.toLowerCase().includes(q) ||
            e.tags.some((t) => t.name.toLowerCase().includes(q))
        )
      : expenses;

    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (orderBy === "expense_date") cmp = a.expense_date.localeCompare(b.expense_date);
      else if (orderBy === "amount") cmp = a.amount - b.amount;
      else cmp = a.category.name.localeCompare(b.category.name);
      return order === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [expenses, search, orderBy, order]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const allocation = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of filtered) {
      totals.set(e.category.name, (totals.get(e.category.name) ?? 0) + e.amount);
    }
    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const sunburstData = useMemo(() => {
    const groups = new Map<string, Map<string, number>>();
    for (const e of filtered) {
      const typeLabel = e.category.type === "need" ? "Need" : "Want";
      if (!groups.has(typeLabel)) groups.set(typeLabel, new Map());
      const catMap = groups.get(typeLabel)!;
      catMap.set(e.category.name, (catMap.get(e.category.name) ?? 0) + e.amount);
    }
    return Array.from(groups.entries()).map(([typeLabel, catMap]) => ({
      name: typeLabel,
      children: Array.from(catMap.entries()).map(([name, value]) => ({ name, value })),
    }));
  }, [filtered]);

  function handleSort(field: SortField) {
    if (orderBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrder("asc");
    }
  }

  function openCreate() {
    setEditing(null);
    setCategoryId("");
    setAmount("");
    setDescription("");
    setNotes("");
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setIsRecurring(false);
    setSelectedTags([]);
    setGoalId("");
    setDialogOpen(true);
  }

  useQuickAdd(openCreate);

  function handleVoiceAdd() {
    if (!voice.supported) {
      toast.error("Voice input isn't supported in this browser.");
      return;
    }
    voice.start((transcript) => {
      const parsed = parseVoiceExpense(transcript, categories);
      setEditing(null);
      setCategoryId(parsed.categoryId ?? "");
      setAmount(parsed.amount !== null ? String(parsed.amount) : "");
      setDescription(parsed.description);
      setNotes("");
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setIsRecurring(false);
      setSelectedTags([]);
      setGoalId("");
      setDialogOpen(true);
      toast.info(`Heard: "${transcript}" - review and save.`);
    });
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setCategoryId(expense.category.id);
    setAmount(String(expense.amount));
    setDescription(expense.description);
    setNotes(expense.notes);
    setExpenseDate(expense.expense_date);
    setIsRecurring(expense.is_recurring);
    setSelectedTags(expense.tags);
    setGoalId(expense.goal_id ?? "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (categoryId === "" || !amount) return;
    setSaving(true);
    try {
      const payload = {
        category_id: categoryId,
        amount: parseFloat(amount),
        description,
        notes,
        expense_date: expenseDate,
        is_recurring: isRecurring,
        tag_ids: selectedTags.map((t) => t.id),
        goal_id: goalId === "" ? null : goalId,
        clear_goal: goalId === "" && editing?.goal_id != null,
      };
      if (editing) {
        await expenseApi.update(editing.id, payload);
        toast.success("Expense updated");
      } else {
        await expenseApi.create(payload);
        toast.success("Expense added");
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save expense"));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(expense: Expense) {
    try {
      await expenseApi.archive(expense.id);
      toast.successWithUndo("Expense archived", async () => {
        await expenseApi.restore(expense.id);
        loadData();
      });
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not archive expense"));
    }
  }

  async function handleRestore(expense: Expense) {
    try {
      await expenseApi.restore(expense.id);
      toast.success("Expense restored");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore expense"));
    }
  }

  async function handleDeletePermanently(expense: Expense) {
    const ok = await confirm(
      "Delete permanently?",
      `Permanently delete "${expense.description || expense.category.name}"? This can't be undone.`
    );
    if (!ok) return;
    try {
      await expenseApi.remove(expense.id);
      toast.success("Expense permanently deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete expense"));
    }
  }

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((e) => e.id)));
    }
  }

  async function handleBulkArchive() {
    try {
      await expenseApi.bulkArchive(Array.from(selected));
      toast.success(`${selected.size} expense(s) archived`);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not archive selected expenses"));
    }
  }

  async function handleBulkRestore() {
    try {
      await expenseApi.bulkRestore(Array.from(selected));
      toast.success(`${selected.size} expense(s) restored`);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore selected expenses"));
    }
  }

  async function handleBulkDelete() {
    const ok = await confirm(
      "Delete permanently?",
      `Permanently delete ${selected.size} selected expense(s)? This can't be undone.`
    );
    if (!ok) return;
    try {
      await expenseApi.bulkDelete(Array.from(selected));
      toast.success(`${selected.size} expense(s) deleted`);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete selected expenses"));
    }
  }

  function exportRows() {
    return filtered.map((e) => ({
      date: e.expense_date,
      category: e.category.name,
      description: e.description,
      notes: e.notes,
      tags: e.tags.map((t) => t.name).join(", "),
      amount: e.amount,
      recurring: e.is_recurring ? "yes" : "no",
    }));
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Expenses
        </Typography>
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, v) => v && setViewMode(v)}
          >
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="archived">Archived</ToggleButton>
          </ToggleButtonGroup>
          {voice.supported && (
            <Tooltip title={voice.listening ? "Listening..." : 'Try: "add 250 for groceries"'}>
              <Button
                variant="outlined"
                color={voice.listening ? "error" : "primary"}
                startIcon={voice.listening ? <MicIcon /> : <MicNoneOutlinedIcon />}
                onClick={handleVoiceAdd}
              >
                {voice.listening ? "Listening…" : "Voice Add"}
              </Button>
            </Tooltip>
          )}
          <ExportMenu filenameBase="expenses" rows={exportRows()} />
          <Button
            variant="outlined"
            startIcon={<ViewColumnIcon />}
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
          >
            Columns
          </Button>
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={() => setColumnMenuAnchor(null)}
          >
            {OPTIONAL_COLUMNS.map((col) => (
              <MenuItem key={col.key} onClick={() => toggleColumn(col.key)} dense>
                <Checkbox size="small" checked={columnPrefs[col.key]} sx={{ p: 0, mr: 1 }} />
                <ListItemText primary={col.label} />
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Expense
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search (description, category, tag)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Category"
              value={filterCategoryId}
              onChange={(e) =>
                setFilterCategoryId(e.target.value === "" ? "" : Number(e.target.value))
              }
              fullWidth
              size="small"
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {selected.size > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" fontWeight={600}>
            {selected.size} selected
          </Typography>
          {viewMode === "active" ? (
            <Button size="small" startIcon={<ArchiveOutlinedIcon />} onClick={handleBulkArchive}>
              Archive
            </Button>
          ) : (
            <>
              <Button size="small" startIcon={<RestoreIcon />} onClick={handleBulkRestore}>
                Restore
              </Button>
              <Button size="small" color="error" startIcon={<DeleteForeverIcon />} onClick={handleBulkDelete}>
                Delete Permanently
              </Button>
            </>
          )}
        </Paper>
      )}

      {!expenses ? (
        <TableSkeleton />
      ) : filtered.length === 0 && expenses.length === 0 ? (
        <EmptyState
          icon={<ReceiptLongOutlinedIcon />}
          title={viewMode === "archived" ? "No archived expenses" : "No expenses yet"}
          description={
            viewMode === "archived"
              ? "Items you archive will show up here."
              : "Track where your money goes — add your first expense to see it here."
          }
          actionLabel={viewMode === "active" ? "Add Expense" : undefined}
          onAction={viewMode === "active" ? openCreate : undefined}
        />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={paginated.length > 0 && selected.size === paginated.length}
                        indeterminate={selected.size > 0 && selected.size < paginated.length}
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    <TableCell sortDirection={orderBy === "expense_date" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "expense_date"}
                        direction={orderBy === "expense_date" ? order : "asc"}
                        onClick={() => handleSort("expense_date")}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    {columnPrefs.category && (
                      <TableCell sortDirection={orderBy === "category" ? order : false}>
                        <TableSortLabel
                          active={orderBy === "category"}
                          direction={orderBy === "category" ? order : "asc"}
                          onClick={() => handleSort("category")}
                        >
                          Category
                        </TableSortLabel>
                      </TableCell>
                    )}
                    <TableCell>Description</TableCell>
                    {columnPrefs.tags && <TableCell>Tags</TableCell>}
                    {columnPrefs.goal && <TableCell>Goal</TableCell>}
                    {columnPrefs.notes && <TableCell>Notes</TableCell>}
                    <TableCell align="right" sortDirection={orderBy === "amount" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "amount"}
                        direction={orderBy === "amount" ? order : "asc"}
                        onClick={() => handleSort("amount")}
                      >
                        Amount
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((e) => (
                    <TableRow key={e.id} hover selected={selected.has(e.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selected.has(e.id)}
                          onChange={() => toggleSelected(e.id)}
                        />
                      </TableCell>
                      <TableCell>{e.expense_date}</TableCell>
                      {columnPrefs.category && <TableCell>{e.category.name}</TableCell>}
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                          {e.description}
                          {e.is_recurring && (
                            <Tooltip title="Recurring">
                              <RepeatIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      {columnPrefs.tags && (
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {e.tags.map((t) => (
                              <Chip
                                key={t.id}
                                label={t.name}
                                size="small"
                                sx={{ bgcolor: t.color, color: "#fff", height: 18, fontSize: 11 }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      )}
                      {columnPrefs.goal && (
                        <TableCell>
                          {e.goal_id != null && (
                            <Chip
                              label={goals.find((g) => g.id === e.goal_id)?.name ?? "Goal"}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: 11 }}
                            />
                          )}
                        </TableCell>
                      )}
                      {columnPrefs.notes && (
                        <TableCell sx={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {e.notes}
                        </TableCell>
                      )}
                      <TableCell align="right">{formatCurrency(e.amount)}</TableCell>
                      <TableCell align="right">
                        {viewMode === "active" ? (
                          <>
                            <IconButton size="small" aria-label="Edit" onClick={() => openEdit(e)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" aria-label="Archive" onClick={() => handleArchive(e)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton size="small" aria-label="Restore" onClick={() => handleRestore(e)}>
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" aria-label="Delete permanently" onClick={() => handleDeletePermanently(e)}>
                              <DeleteForeverIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5 + Object.values(columnPrefs).filter(Boolean).length}
                        align="center"
                        sx={{ py: 4 }}
                      >
                        <Typography color="text.secondary">
                          No expenses match your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filtered.length > 0 && (
                <TablePagination
                  component="div"
                  count={filtered.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <PieChart title="By Category" data={allocation} />
            </Paper>
          </Grid>
          {sunburstData.length > 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <SunburstChart title="Need vs Want → Category" data={sunburstData} />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            fullWidth
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} ({c.type})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TagsInput value={selectedTags} onChange={setSelectedTags} />
          <TextField
            select
            label="Link to Goal (optional)"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value === "" ? "" : Number(e.target.value))}
            fullWidth
          >
            <MenuItem value="">No goal</MenuItem>
            {goals.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            }
            label="Repeats monthly"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <LoadingButton variant="contained" loading={saving} onClick={handleSave}>
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <ImportExpensesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImported={loadData}
      />
      {ConfirmDialog}
    </Box>
  );
}
