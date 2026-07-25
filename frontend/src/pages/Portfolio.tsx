import AddIcon from "@mui/icons-material/Add";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { portfolioApi } from "@/api/portfolioApi";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { PieChart } from "@/components/charts/PieChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { TreemapChart } from "@/components/charts/TreemapChart";
import { ExportMenu } from "@/components/ExportMenu";
import { LoadingButton } from "@/components/LoadingButton";
import { TableSkeleton } from "@/components/Skeletons";
import { TagsInput } from "@/components/TagsInput";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { Tag } from "@/types/tag";
import { AssetType, PortfolioHolding } from "@/types/portfolio";
import { formatCurrency, formatPercent } from "@/utils/format";

type ViewMode = "active" | "archived";

const ASSET_TYPES: AssetType[] = [
  "stock",
  "etf",
  "mutual_fund",
  "gold",
  "silver",
  "fd",
  "ppf",
  "nps",
  "crypto",
  "bond",
];

type SortField = "symbol" | "profit_loss" | "cagr_pct" | "current_value";
type Order = "asc" | "desc";

export function Portfolio() {
  useDocumentTitle("Portfolio");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [holdings, setHoldings] = useState<PortfolioHolding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioHolding | null>(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [orderBy, setOrderBy] = useState<SortField>("current_value");
  const [order, setOrder] = useState<Order>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [sector, setSector] = useState("");
  const [broker, setBroker] = useState("");
  const [exchange, setExchange] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currentPrice, setCurrentPrice] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  function loadData() {
    portfolioApi
      .list({ archived_only: viewMode === "archived" })
      .then(setHoldings)
      .catch(() => setError("Could not load portfolio."));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadData, [viewMode]);

  const filtered = useMemo(() => {
    if (!holdings) return [];
    const q = search.trim().toLowerCase();
    const rows = q
      ? holdings.filter(
          (h) =>
            h.symbol.toLowerCase().includes(q) ||
            h.name.toLowerCase().includes(q) ||
            h.sector.toLowerCase().includes(q)
        )
      : holdings;

    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (orderBy === "symbol") cmp = a.symbol.localeCompare(b.symbol);
      else if (orderBy === "profit_loss") cmp = a.profit_loss - b.profit_loss;
      else if (orderBy === "cagr_pct") cmp = (a.cagr_pct ?? -Infinity) - (b.cagr_pct ?? -Infinity);
      else cmp = a.current_value - b.current_value;
      return order === "asc" ? cmp : -cmp;
    });
  }, [holdings, search, orderBy, order]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const assetAllocation = useMemo(() => {
    const totals = new Map<string, number>();
    for (const h of filtered) {
      totals.set(h.asset_type, (totals.get(h.asset_type) ?? 0) + h.current_value);
    }
    return Array.from(totals.entries()).map(([name_, value]) => ({ name: name_, value }));
  }, [filtered]);

  const sectorAllocation = useMemo(() => {
    const totals = new Map<string, number>();
    for (const h of filtered) {
      const key = h.sector || "Unclassified";
      totals.set(key, (totals.get(key) ?? 0) + h.current_value);
    }
    return Array.from(totals.entries()).map(([name_, value]) => ({ name: name_, value }));
  }, [filtered]);

  const heatmapData = useMemo(
    () =>
      filtered.map((h) => ({
        name: h.symbol,
        value: h.current_value,
        colorValue: h.profit_loss_pct,
      })),
    [filtered]
  );

  const diversificationRadar = useMemo(() => {
    const totals = new Map<string, number>();
    let grandTotal = 0;
    for (const h of filtered) {
      totals.set(h.asset_type, (totals.get(h.asset_type) ?? 0) + h.current_value);
      grandTotal += h.current_value;
    }
    const indicators = Array.from(totals.keys()).map((name) => ({ name, max: grandTotal || 1 }));
    const values = Array.from(totals.values());
    return { indicators, values };
  }, [filtered]);

  const bubbleData = useMemo(
    () =>
      filtered.map((h) => ({
        name: h.symbol,
        x: h.invested_value,
        y: h.profit_loss_pct,
        size: h.current_value,
        colorValue: h.profit_loss_pct,
      })),
    [filtered]
  );

  function handleSort(field: SortField) {
    if (orderBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrder("desc");
    }
  }

  function resetForm() {
    setSymbol("");
    setName("");
    setAssetType("stock");
    setSector("");
    setBroker("");
    setExchange("");
    setQuantity("");
    setBuyPrice("");
    setBuyDate(new Date().toISOString().slice(0, 10));
    setCurrentPrice("");
    setSelectedTags([]);
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  }

  useQuickAdd(openCreate);

  function openEdit(holding: PortfolioHolding) {
    setEditing(holding);
    setSymbol(holding.symbol);
    setName(holding.name);
    setAssetType(holding.asset_type);
    setSector(holding.sector);
    setBroker(holding.broker);
    setExchange(holding.exchange);
    setQuantity(String(holding.quantity));
    setBuyPrice(String(holding.buy_price));
    setBuyDate(holding.buy_date);
    setCurrentPrice(String(holding.current_price));
    setSelectedTags(holding.tags);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!symbol || !quantity || !buyPrice || !currentPrice) return;
    setSaving(true);
    try {
      const payload = {
        symbol: symbol.toUpperCase(),
        name,
        asset_type: assetType,
        sector,
        broker,
        exchange,
        quantity: parseFloat(quantity),
        buy_price: parseFloat(buyPrice),
        buy_date: buyDate,
        current_price: parseFloat(currentPrice),
        tag_ids: selectedTags.map((t) => t.id),
      };
      if (editing) {
        await portfolioApi.update(editing.id, payload);
        toast.success("Holding updated");
      } else {
        await portfolioApi.create(payload);
        toast.success("Holding added");
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save holding"));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(holding: PortfolioHolding) {
    try {
      await portfolioApi.archive(holding.id);
      toast.successWithUndo(`${holding.symbol} archived`, async () => {
        await portfolioApi.restore(holding.id);
        loadData();
      });
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not archive holding"));
    }
  }

  async function handleRestore(holding: PortfolioHolding) {
    try {
      await portfolioApi.restore(holding.id);
      toast.success(`${holding.symbol} restored`);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore holding"));
    }
  }

  async function handleDeletePermanently(holding: PortfolioHolding) {
    const ok = await confirm(
      "Delete permanently?",
      `Permanently remove ${holding.symbol} from your portfolio? This can't be undone.`
    );
    if (!ok) return;
    try {
      await portfolioApi.remove(holding.id);
      toast.success("Holding permanently deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete holding"));
    }
  }

  function exportRows() {
    return filtered.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      asset_type: h.asset_type,
      sector: h.sector,
      tags: h.tags.map((t) => t.name).join(", "),
      quantity: h.quantity,
      buy_price: h.buy_price,
      current_price: h.current_price,
      invested_value: h.invested_value,
      current_value: h.current_value,
      profit_loss: h.profit_loss,
      profit_loss_pct: h.profit_loss_pct.toFixed(2),
      cagr_pct: h.cagr_pct !== null ? h.cagr_pct.toFixed(2) : "",
    }));
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Portfolio
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
          <ExportMenu filenameBase="portfolio" rows={exportRows()} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Holding
          </Button>
        </Box>
      </Box>

      <TextField
        label="Search by symbol, name, or sector"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 360 }}
      />

      {!holdings ? (
        <TableSkeleton />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sortDirection={orderBy === "symbol" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "symbol"}
                        direction={orderBy === "symbol" ? order : "asc"}
                        onClick={() => handleSort("symbol")}
                      >
                        Symbol
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Buy Price</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right" sortDirection={orderBy === "profit_loss" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "profit_loss"}
                        direction={orderBy === "profit_loss" ? order : "asc"}
                        onClick={() => handleSort("profit_loss")}
                      >
                        P&amp;L
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={orderBy === "cagr_pct" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "cagr_pct"}
                        direction={orderBy === "cagr_pct" ? order : "asc"}
                        onClick={() => handleSort("cagr_pct")}
                      >
                        CAGR
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((h) => (
                    <TableRow key={h.id} hover>
                      <TableCell>{h.symbol}</TableCell>
                      <TableCell>{h.asset_type}</TableCell>
                      <TableCell>{h.sector || "—"}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {h.tags.map((t) => (
                            <Chip
                              key={t.id}
                              label={t.name}
                              size="small"
                              sx={{ bgcolor: t.color, color: "#fff", height: 18, fontSize: 11 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{h.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(h.buy_price)}</TableCell>
                      <TableCell align="right">{formatCurrency(h.current_price)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: h.profit_loss >= 0 ? "success.main" : "error.main" }}
                      >
                        {formatCurrency(h.profit_loss)} ({formatPercent(h.profit_loss_pct)})
                      </TableCell>
                      <TableCell align="right">
                        {h.cagr_pct !== null ? formatPercent(h.cagr_pct) : "—"}
                      </TableCell>
                      <TableCell align="right">
                        {viewMode === "active" ? (
                          <>
                            <IconButton size="small" aria-label="Edit" onClick={() => openEdit(h)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" aria-label="Archive" onClick={() => handleArchive(h)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton size="small" aria-label="Restore" onClick={() => handleRestore(h)}>
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" aria-label="Delete permanently" onClick={() => handleDeletePermanently(h)}>
                              <DeleteForeverIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {holdings.length === 0
                            ? "No holdings yet — add your first one to see it here."
                            : "No holdings match your search."}
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
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <PieChart title="By Asset Type" data={assetAllocation} />
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <PieChart title="By Sector" data={sectorAllocation} />
              </Paper>
            </Box>
          </Grid>
          {heatmapData.length > 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <TreemapChart title="Heatmap (size = value, color = P&L %)" data={heatmapData} />
              </Paper>
            </Grid>
          )}
          {diversificationRadar.indicators.length >= 3 && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <RadarChart
                  title="Diversification"
                  indicators={diversificationRadar.indicators}
                  series={[{ name: "Current Value", values: diversificationRadar.values }]}
                />
              </Paper>
            </Grid>
          )}
          {bubbleData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <BubbleChart
                  title="Risk vs Reward (bubble size = current value)"
                  xLabel="Invested"
                  yLabel="P&L %"
                  data={bubbleData}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Holding" : "Add Holding"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} fullWidth />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            select
            label="Asset Type"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as AssetType)}
            fullWidth
          >
            {ASSET_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Sector" value={sector} onChange={(e) => setSector(e.target.value)} fullWidth />
          <TextField label="Broker" value={broker} onChange={(e) => setBroker(e.target.value)} fullWidth />
          <TextField
            label="Exchange"
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            fullWidth
          />
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
          />
          <TextField
            label="Buy Price"
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            fullWidth
          />
          <TextField
            label="Buy Date"
            type="date"
            value={buyDate}
            onChange={(e) => setBuyDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Current Price"
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            fullWidth
          />
          <TagsInput value={selectedTags} onChange={setSelectedTags} />
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
