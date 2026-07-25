import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import { expenseApi } from "@/api/expenseApi";
import { LoadingButton } from "@/components/LoadingButton";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { ExpenseImportItem, ExpenseBulkImportResult } from "@/types/expense";
import { parseCsv } from "@/utils/csv";

interface ImportExpensesDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const REQUIRED_FIELDS: { key: keyof ExpenseImportItem; label: string }[] = [
  { key: "category_name", label: "Category" },
  { key: "amount", label: "Amount" },
  { key: "expense_date", label: "Date" },
  { key: "description", label: "Description" },
];

export function ImportExpensesDialog({ open, onClose, onImported }: ImportExpensesDialogProps) {
  const toast = useToast();
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ExpenseBulkImportResult | null>(null);

  function reset() {
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text);
    setFileName(file.name);
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setResult(null);

    const autoMapping: Record<string, string> = {};
    for (const field of REQUIRED_FIELDS) {
      const match = parsed.headers.find(
        (h) => h.trim().toLowerCase().replace(/[\s_]/g, "") === field.key.replace(/_/g, "")
      );
      if (match) autoMapping[field.key] = match;
    }
    setMapping(autoMapping);
  }

  const items: ExpenseImportItem[] = useMemo(() => {
    const catIdx = headers.indexOf(mapping.category_name);
    const amountIdx = headers.indexOf(mapping.amount);
    const dateIdx = headers.indexOf(mapping.expense_date);
    const descIdx = headers.indexOf(mapping.description);
    if (catIdx === -1 || amountIdx === -1 || dateIdx === -1) return [];

    return rows
      .map((row) => ({
        category_name: (row[catIdx] ?? "").trim(),
        amount: parseFloat(row[amountIdx] ?? "0"),
        expense_date: (row[dateIdx] ?? "").trim(),
        description: descIdx !== -1 ? (row[descIdx] ?? "").trim() : "",
      }))
      .filter((item) => item.category_name && item.amount > 0 && item.expense_date);
  }, [headers, rows, mapping]);

  const readyToImport = headers.length > 0 && items.length > 0 && !result;

  async function handleImport() {
    setImporting(true);
    try {
      const res = await expenseApi.bulkImport(items);
      setResult(res);
      if (res.imported > 0) {
        toast.success(`Imported ${res.imported} expense(s)`);
        onImported();
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not import expenses"));
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Import Expenses from CSV</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
          {fileName || "Choose CSV file"}
          <input
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </Button>

        {headers.length > 0 && !result && (
          <>
            <Typography variant="subtitle2">Map columns</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {REQUIRED_FIELDS.map((field) => (
                <TextField
                  key={field.key}
                  select
                  label={field.label}
                  value={mapping[field.key] ?? ""}
                  onChange={(e) => setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  sx={{ minWidth: 160 }}
                  size="small"
                >
                  <MenuItem value="">Not mapped</MenuItem>
                  {headers.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
            </Box>

            <Typography variant="subtitle2">
              Preview ({items.length} of {rows.length} row(s) ready to import)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.slice(0, 10).map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.category_name}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.expense_date}</TableCell>
                    <TableCell>{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {result && (
          <Alert severity={result.skipped > 0 ? "warning" : "success"}>
            Imported {result.imported}, skipped {result.skipped}.
            {result.errors.length > 0 && (
              <Box component="ul" mt={1} mb={0} pl={2}>
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </Box>
            )}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{result ? "Close" : "Cancel"}</Button>
        {readyToImport && (
          <LoadingButton variant="contained" loading={importing} onClick={handleImport}>
            Import {items.length} Expense(s)
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
