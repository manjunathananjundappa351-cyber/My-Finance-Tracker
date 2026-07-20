import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import RepeatIcon from "@mui/icons-material/Repeat";
import RestoreIcon from "@mui/icons-material/Restore";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
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

import { incomeApi } from "@/api/incomeApi";
import { PieChart } from "@/components/charts/PieChart";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { EmptyState } from "@/components/EmptyState";
import { ExportMenu } from "@/components/ExportMenu";
import { LoadingButton } from "@/components/LoadingButton";
import { TableSkeleton } from "@/components/Skeletons";
import { TagsInput } from "@/components/TagsInput";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { Income as IncomeEntry, IncomeCategory } from "@/types/income";
import { Tag } from "@/types/tag";
import { formatCurrency } from "@/utils/format";

type SortField = "income_date" | "amount" | "category";
type Order = "asc" | "desc";
type ViewMode = "active" | "archived";

export function Income() {
  useDocumentTitle("Income");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[] | null>(null);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  const [orderBy, setOrderBy] = useState<SortField>("income_date");
  const [order, setOrder] = useState<Order>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [incomeDate, setIncomeDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  function loadData() {
    Promise.all([
      incomeApi.list({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category_id: filterCategoryId === "" ? undefined : filterCategoryId,
        archived_only: viewMode === "archived",
      }),
      categories.length ? Promise.resolve(categories) : incomeApi.listCategories(),
    ])
      .then(([incomeList, categoryList]) => {
        setIncomeEntries(incomeList);
        setCategories(categoryList);
        setSelected(new Set());
      })
      .catch(() => setError("Could not load income."));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadData, [startDate, endDate, filterCategoryId, viewMode]);

  const filtered = useMemo(() => {
    if (!incomeEntries) return [];
    const q = search.trim().toLowerCase();
    const rows = q
      ? incomeEntries.filter(
          (i) =>
            i.description.toLowerCase().includes(q) ||
            i.category.name.toLowerCase().includes(q) ||
            i.tags.some((t) => t.name.toLowerCase().includes(q))
        )
      : incomeEntries;

    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (orderBy === "income_date") cmp = a.income_date.localeCompare(b.income_date);
      else if (orderBy === "amount") cmp = a.amount - b.amount;
      else cmp = a.category.name.localeCompare(b.category.name);
      return order === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [incomeEntries, search, orderBy, order]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const allocation = useMemo(() => {
    const totals = new Map<string, number>();
    for (const i of filtered) {
      totals.set(i.category.name, (totals.get(i.category.name) ?? 0) + i.amount);
    }
    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
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
    setIncomeDate(new Date().toISOString().slice(0, 10));
    setIsRecurring(false);
    setSelectedTags([]);
    setDialogOpen(true);
  }

  function openEdit(income: IncomeEntry) {
    setEditing(income);
    setCategoryId(income.category.id);
    setAmount(String(income.amount));
    setDescription(income.description);
    setNotes(income.notes);
    setIncomeDate(income.income_date);
    setIsRecurring(income.is_recurring);
    setSelectedTags(income.tags);
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
        income_date: incomeDate,
        is_recurring: isRecurring,
        tag_ids: selectedTags.map((t) => t.id),
      };
      if (editing) {
        await incomeApi.update(editing.id, payload);
        toast.success("Income updated");
      } else {
        await incomeApi.create(payload);
        toast.success("Income added");
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save income"));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(income: IncomeEntry) {
    try {
      await incomeApi.archive(income.id);
      toast.successWithUndo("Income archived", async () => {
        await incomeApi.restore(income.id);
        loadData();
      });
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not archive income"));
    }
  }

  async function handleRestore(income: IncomeEntry) {
    try {
      await incomeApi.restore(income.id);
      toast.success("Income restored");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore income"));
    }
  }

  async function handleDeletePermanently(income: IncomeEntry) {
    const ok = await confirm(
      "Delete permanently?",
      `Permanently delete "${income.description || income.category.name}"? This can't be undone.`
    );
    if (!ok) return;
    try {
      await incomeApi.remove(income.id);
      toast.success("Income permanently deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete income"));
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
      setSelected(new Set(paginated.map((i) => i.id)));
    }
  }

  async function handleBulkArchive() {
    try {
      await incomeApi.bulkArchive(Array.from(selected));
      toast.success(`${selected.size} income entr${selected.size === 1 ? "y" : "ies"} archived`);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not archive selected income"));
    }
  }

  async function handleBulkRestore() {
    try {
      await incomeApi.bulkRestore(Array.from(selected));
      toast.success(`${selected.size} income entr${selected.size === 1 ? "y" : "ies"} restored`);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore selected income"));
    }
  }

  async function handleBulkDelete() {
    const ok = await confirm(
      "Delete permanently?",
      `Permanently delete ${selected.size} selected income entr${selected.size === 1 ? "y" : "ies"}? This can't be undone.`
    );
    if (!ok) return;
    try {
      await incomeApi.bulkDelete(Array.from(selected));
      toast.success("Deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete selected income"));
    }
  }

  function exportRows() {
    return filtered.map((i) => ({
      date: i.income_date,
      category: i.category.name,
      description: i.description,
      notes: i.notes,
      tags: i.tags.map((t) => t.name).join(", "),
      amount: i.amount,
      recurring: i.is_recurring ? "yes" : "no",
    }));
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Income
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
          <ExportMenu filenameBase="income" rows={exportRows()} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Income
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

      {!incomeEntries ? (
        <TableSkeleton />
      ) : filtered.length === 0 && incomeEntries.length === 0 ? (
        <EmptyState
          icon={<SavingsOutlinedIcon />}
          title={viewMode === "archived" ? "No archived income" : "No income yet"}
          description={
            viewMode === "archived"
              ? "Items you archive will show up here."
              : "Log your salary, freelance, or dividend income to see it here."
          }
          actionLabel={viewMode === "active" ? "Add Income" : undefined}
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
                    <TableCell sortDirection={orderBy === "income_date" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "income_date"}
                        direction={orderBy === "income_date" ? order : "asc"}
                        onClick={() => handleSort("income_date")}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={orderBy === "category" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "category"}
                        direction={orderBy === "category" ? order : "asc"}
                        onClick={() => handleSort("category")}
                      >
                        Category
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Description</TableCell>
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
                  {paginated.map((i) => (
                    <TableRow key={i.id} hover selected={selected.has(i.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selected.has(i.id)}
                          onChange={() => toggleSelected(i.id)}
                        />
                      </TableCell>
                      <TableCell>{i.income_date}</TableCell>
                      <TableCell>{i.category.name}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                          {i.description}
                          {i.is_recurring && (
                            <Tooltip title="Recurring">
                              <RepeatIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                            </Tooltip>
                          )}
                          {i.tags.map((t) => (
                            <Chip
                              key={t.id}
                              label={t.name}
                              size="small"
                              sx={{ bgcolor: t.color, color: "#fff", height: 18, fontSize: 11 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(i.amount)}</TableCell>
                      <TableCell align="right">
                        {viewMode === "active" ? (
                          <>
                            <IconButton size="small" onClick={() => openEdit(i)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleArchive(i)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton size="small" onClick={() => handleRestore(i)}>
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeletePermanently(i)}>
                              <DeleteForeverIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No income matches your filters.
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
              <PieChart title="By Source" data={allocation} />
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Income" : "Add Income"}</DialogTitle>
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
                {c.name}
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
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TagsInput value={selectedTags} onChange={setSelectedTags} />
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
      {ConfirmDialog}
    </Box>
  );
}
