import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Dialog,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Command {
  label: string;
  path: string;
  icon: JSX.Element;
  keywords?: string;
}

const COMMANDS: Command[] = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon fontSize="small" /> },
  { label: "Expenses", path: "/expenses", icon: <PaidIcon fontSize="small" />, keywords: "add spend" },
  {
    label: "Income",
    path: "/income",
    icon: <AccountBalanceWalletIcon fontSize="small" />,
    keywords: "salary",
  },
  {
    label: "Portfolio",
    path: "/portfolio",
    icon: <TrendingUpIcon fontSize="small" />,
    keywords: "stocks holdings",
  },
  { label: "Budget", path: "/budget", icon: <SavingsOutlinedIcon fontSize="small" /> },
  { label: "Goals", path: "/goals", icon: <FlagOutlinedIcon fontSize="small" /> },
  {
    label: "Loans",
    path: "/loans",
    icon: <CreditCardOutlinedIcon fontSize="small" />,
    keywords: "emi debt",
  },
  {
    label: "Trading Journal",
    path: "/trades",
    icon: <MenuBookOutlinedIcon fontSize="small" />,
    keywords: "trades win rate",
  },
  {
    label: "SIP Calculator",
    path: "/sip-calculator",
    icon: <CalculateOutlinedIcon fontSize="small" />,
    keywords: "systematic investment",
  },
  { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords?.toLowerCase().includes(q)
    );
  }, [query]);

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <TextField
        autoFocus
        placeholder="Jump to…"
        variant="standard"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{ disableUnderline: true, sx: { px: 2, py: 1.5, fontSize: "1.05rem" } }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && filtered[0]) go(filtered[0].path);
        }}
      />
      <List sx={{ pt: 0 }}>
        {filtered.map((c) => (
          <ListItemButton key={c.path} onClick={() => go(c.path)}>
            <ListItemIcon sx={{ minWidth: 36 }}>{c.icon}</ListItemIcon>
            <ListItemText primary={c.label} />
          </ListItemButton>
        ))}
        {filtered.length === 0 && (
          <ListItemButton disabled>
            <ListItemText primary="No matches" />
          </ListItemButton>
        )}
      </List>
    </Dialog>
  );
}
