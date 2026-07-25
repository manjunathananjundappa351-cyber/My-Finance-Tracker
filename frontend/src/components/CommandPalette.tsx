import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Dialog,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { searchApi } from "@/api/searchApi";
import { SearchResult } from "@/types/search";

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
  {
    label: "System Health",
    path: "/system-health",
    icon: <MonitorHeartOutlinedIcon fontSize="small" />,
    keywords: "status uptime",
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: <CalendarMonthOutlinedIcon fontSize="small" />,
    keywords: "due dates emi",
  },
  {
    label: "Activity",
    path: "/activity",
    icon: <HistoryOutlinedIcon fontSize="small" />,
    keywords: "history audit log",
  },
  { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dataResults, setDataResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        navigate("/expenses?quickAdd=1");
        return;
      }
      if (meta && e.key.toLowerCase() === "p") {
        e.preventDefault();
        navigate("/portfolio");
        return;
      }
      if (meta && e.key.toLowerCase() === "g") {
        e.preventDefault();
        navigate("/goals");
        return;
      }
      if (meta && e.key === "/") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setDataResults([]);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setDataResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchApi
        .search(q)
        .then((res) => setDataResults(res.results))
        .catch(() => setDataResults([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const filteredCommands = useMemo(() => {
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

  const noMatches = filteredCommands.length === 0 && dataResults.length === 0;

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
        placeholder="Jump to a page, or search your data…"
        variant="standard"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{ disableUnderline: true, sx: { px: 2, py: 1.5, fontSize: "1.05rem" } }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && filteredCommands[0]) go(filteredCommands[0].path);
        }}
      />
      <List sx={{ pt: 0, maxHeight: 420, overflowY: "auto" }}>
        {filteredCommands.map((c) => (
          <ListItemButton key={c.path} onClick={() => go(c.path)}>
            <ListItemIcon sx={{ minWidth: 36 }}>{c.icon}</ListItemIcon>
            <ListItemText primary={c.label} />
          </ListItemButton>
        ))}
        {dataResults.length > 0 && (
          <>
            <ListSubheader>Your data</ListSubheader>
            {dataResults.map((r) => (
              <ListItemButton key={`${r.type}-${r.id}`} onClick={() => go(r.path)}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SearchIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={r.title} secondary={r.subtitle} />
              </ListItemButton>
            ))}
          </>
        )}
        {noMatches && (
          <ListItemButton disabled>
            <ListItemText primary="No matches" />
          </ListItemButton>
        )}
      </List>
    </Dialog>
  );
}
