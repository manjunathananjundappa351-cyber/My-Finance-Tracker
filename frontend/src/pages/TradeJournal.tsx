import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { tradeApi } from "@/api/tradeApi";
import { LoadingButton } from "@/components/LoadingButton";
import { StatCard } from "@/components/StatCard";
import { TableSkeleton } from "@/components/Skeletons";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { Trade, TradeAnalytics, TradeDirection } from "@/types/trade";
import { formatCurrency } from "@/utils/format";

export function TradeJournal() {
  useDocumentTitle("Trading Journal");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [saving, setSaving] = useState(false);

  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [exitPrice, setExitPrice] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [strategy, setStrategy] = useState("");
  const [emotion, setEmotion] = useState("");
  const [mistake, setMistake] = useState("");
  const [lessons, setLessons] = useState("");

  function loadData() {
    Promise.all([tradeApi.list(), tradeApi.analytics()])
      .then(([tradeList, analyticsData]) => {
        setTrades(tradeList);
        setAnalytics(analyticsData);
      })
      .catch(() => setError("Could not load trading journal."));
  }

  useEffect(loadData, []);

  function resetForm() {
    setSymbol("");
    setDirection("long");
    setQuantity("");
    setEntryPrice("");
    setEntryDate(new Date().toISOString().slice(0, 10));
    setExitPrice("");
    setExitDate("");
    setStrategy("");
    setEmotion("");
    setMistake("");
    setLessons("");
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(trade: Trade) {
    setEditing(trade);
    setSymbol(trade.symbol);
    setDirection(trade.direction);
    setQuantity(String(trade.quantity));
    setEntryPrice(String(trade.entry_price));
    setEntryDate(trade.entry_date);
    setExitPrice(trade.exit_price !== null ? String(trade.exit_price) : "");
    setExitDate(trade.exit_date ?? "");
    setStrategy(trade.strategy);
    setEmotion(trade.emotion);
    setMistake(trade.mistake);
    setLessons(trade.lessons);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!symbol || !quantity || !entryPrice) return;
    setSaving(true);
    try {
      const payload = {
        symbol: symbol.toUpperCase(),
        direction,
        quantity: parseFloat(quantity),
        entry_price: parseFloat(entryPrice),
        entry_date: entryDate,
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        exit_date: exitDate || null,
        strategy,
        emotion,
        mistake,
        lessons,
      };
      if (editing) {
        await tradeApi.update(editing.id, payload);
        toast.success("Trade updated");
      } else {
        await tradeApi.create(payload);
        toast.success("Trade logged");
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save trade"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(trade: Trade) {
    const ok = await confirm("Delete trade?", `Remove the ${trade.symbol} entry?`);
    if (!ok) return;
    try {
      await tradeApi.remove(trade.id);
      toast.success("Trade deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete trade"));
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!trades || !analytics) return <TableSkeleton />;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Trading Journal
        </Typography>
        <LoadingButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Log Trade
        </LoadingButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Win Rate" value={analytics.win_rate_pct} format={(n) => `${n.toFixed(0)}%`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total P&L"
            value={analytics.total_profit_loss}
            format={formatCurrency}
            positive={analytics.total_profit_loss >= 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Closed Trades" value={analytics.closed_trades} format={(n) => n.toFixed(0)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Avg Holding"
            value={analytics.average_holding_days ?? 0}
            format={(n) => `${n.toFixed(1)} days`}
          />
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Entry</TableCell>
              <TableCell align="right">Exit</TableCell>
              <TableCell align="right">P&amp;L</TableCell>
              <TableCell>Strategy / Emotion</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.entry_date}</TableCell>
                <TableCell>{t.symbol}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={t.direction}
                    color={t.direction === "long" ? "success" : "error"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{t.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(t.entry_price)}</TableCell>
                <TableCell align="right">
                  {t.exit_price !== null ? formatCurrency(t.exit_price) : "Open"}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      t.profit_loss === null
                        ? "text.secondary"
                        : t.profit_loss >= 0
                          ? "success.main"
                          : "error.main",
                  }}
                >
                  {t.profit_loss !== null ? formatCurrency(t.profit_loss) : "-"}
                </TableCell>
                <TableCell>
                  {[t.strategy, t.emotion].filter(Boolean).join(" / ") || "-"}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(t)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(t)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {trades.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No trades logged yet - add your first one to start tracking patterns.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Trade" : "Log Trade"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} fullWidth />
          <TextField
            select
            label="Direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as TradeDirection)}
            fullWidth
          >
            <MenuItem value="long">Long</MenuItem>
            <MenuItem value="short">Short</MenuItem>
          </TextField>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
          />
          <TextField
            label="Entry Price"
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            fullWidth
          />
          <TextField
            label="Entry Date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Exit Price (leave blank if open)"
            type="number"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            fullWidth
          />
          <TextField
            label="Exit Date"
            type="date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField label="Strategy" value={strategy} onChange={(e) => setStrategy(e.target.value)} fullWidth />
          <TextField label="Emotion" value={emotion} onChange={(e) => setEmotion(e.target.value)} fullWidth />
          <TextField label="Mistake" value={mistake} onChange={(e) => setMistake(e.target.value)} fullWidth />
          <TextField
            label="Lessons"
            value={lessons}
            onChange={(e) => setLessons(e.target.value)}
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
      {ConfirmDialog}
    </Box>
  );
}
