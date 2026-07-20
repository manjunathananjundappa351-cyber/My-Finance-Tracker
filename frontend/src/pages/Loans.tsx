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
import { useEffect, useState } from "react";

import { loanApi } from "@/api/loanApi";
import { LoadingButton } from "@/components/LoadingButton";
import { StatCardsSkeleton } from "@/components/Skeletons";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { Loan, LoanType } from "@/types/loan";
import { formatCurrency } from "@/utils/format";

const LOAN_TYPES: LoanType[] = ["home", "car", "education", "personal", "other"];

export function Loans() {
  useDocumentTitle("Loans");
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [loans, setLoans] = useState<Loan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Loan | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [loanType, setLoanType] = useState<LoanType>("home");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [outstandingBalance, setOutstandingBalance] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tenureMonths, setTenureMonths] = useState("");

  function loadData() {
    loanApi
      .list()
      .then(setLoans)
      .catch(() => setError("Could not load loans."));
  }

  useEffect(loadData, []);

  function resetForm() {
    setName("");
    setLoanType("home");
    setPrincipalAmount("");
    setInterestRate("");
    setEmiAmount("");
    setOutstandingBalance("");
    setStartDate(new Date().toISOString().slice(0, 10));
    setTenureMonths("");
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(loan: Loan) {
    setEditing(loan);
    setName(loan.name);
    setLoanType(loan.loan_type);
    setPrincipalAmount(String(loan.principal_amount));
    setInterestRate(String(loan.interest_rate));
    setEmiAmount(String(loan.emi_amount));
    setOutstandingBalance(String(loan.outstanding_balance));
    setStartDate(loan.start_date);
    setTenureMonths(String(loan.tenure_months));
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name || !principalAmount || !emiAmount || !outstandingBalance || !tenureMonths) return;
    setSaving(true);
    try {
      const payload = {
        name,
        loan_type: loanType,
        principal_amount: parseFloat(principalAmount),
        interest_rate: parseFloat(interestRate || "0"),
        emi_amount: parseFloat(emiAmount),
        outstanding_balance: parseFloat(outstandingBalance),
        start_date: startDate,
        tenure_months: parseInt(tenureMonths, 10),
      };
      if (editing) {
        await loanApi.update(editing.id, payload);
        toast.success("Loan updated");
      } else {
        await loanApi.create(payload);
        toast.success("Loan added");
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save loan"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(loan: Loan) {
    const ok = await confirm("Delete loan?", `Remove "${loan.name}"?`);
    if (!ok) return;
    try {
      await loanApi.remove(loan.id);
      toast.success("Loan deleted");
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete loan"));
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!loans) return <StatCardsSkeleton count={3} />;

  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding_balance, 0);
  const totalEmi = loans.reduce((sum, l) => sum + l.emi_amount, 0);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Loans
        </Typography>
        <LoadingButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Loan
        </LoadingButton>
      </Box>

      {loans.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Outstanding
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(totalOutstanding)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Monthly EMI
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(totalEmi)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {loans.length === 0 ? (
        <Alert severity="info">No loans tracked yet. Add one to monitor EMI and payoff progress.</Alert>
      ) : (
        <Grid container spacing={2}>
          {loans.map((l, i) => (
            <Grid item xs={12} sm={6} md={4} key={l.id}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                variant="outlined"
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {l.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {l.loan_type} - {l.interest_rate}% p.a.
                      </Typography>
                    </Box>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => openEdit(l)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(l)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {formatCurrency(l.outstanding_balance)} outstanding of{" "}
                    {formatCurrency(l.principal_amount)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(l.progress_pct, 100)}
                    sx={{ height: 8, borderRadius: 4, mt: 1.5, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {l.progress_pct.toFixed(0)}% paid off
                  </Typography>
                  <Typography variant="body2" fontWeight={600} mt={1}>
                    EMI {formatCurrency(l.emi_amount)}/mo - next due {l.next_due_date}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Loan" : "Add Loan"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            select
            label="Type"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value as LoanType)}
            fullWidth
          >
            {LOAN_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Principal Amount"
            type="number"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            fullWidth
          />
          <TextField
            label="Interest Rate (% p.a.)"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            fullWidth
          />
          <TextField
            label="EMI Amount"
            type="number"
            value={emiAmount}
            onChange={(e) => setEmiAmount(e.target.value)}
            fullWidth
          />
          <TextField
            label="Outstanding Balance"
            type="number"
            value={outstandingBalance}
            onChange={(e) => setOutstandingBalance(e.target.value)}
            fullWidth
          />
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Tenure (months)"
            type="number"
            value={tenureMonths}
            onChange={(e) => setTenureMonths(e.target.value)}
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
