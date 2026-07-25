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
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

const DRAWER_WIDTH = 232;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon fontSize="small" /> },
  { label: "Expenses", path: "/expenses", icon: <PaidIcon fontSize="small" /> },
  { label: "Income", path: "/income", icon: <AccountBalanceWalletIcon fontSize="small" /> },
  { label: "Portfolio", path: "/portfolio", icon: <TrendingUpIcon fontSize="small" /> },
  { label: "Budget", path: "/budget", icon: <SavingsOutlinedIcon fontSize="small" /> },
  { label: "Goals", path: "/goals", icon: <FlagOutlinedIcon fontSize="small" /> },
  { label: "Loans", path: "/loans", icon: <CreditCardOutlinedIcon fontSize="small" /> },
  { label: "Trading Journal", path: "/trades", icon: <MenuBookOutlinedIcon fontSize="small" /> },
  { label: "SIP Calculator", path: "/sip-calculator", icon: <CalculateOutlinedIcon fontSize="small" /> },
  { label: "Calendar", path: "/calendar", icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
  { label: "Activity", path: "/activity", icon: <HistoryOutlinedIcon fontSize="small" /> },
  { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
  { label: "System Health", path: "/system-health", icon: <MonitorHeartOutlinedIcon fontSize="small" /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const content = (
    <>
      <Toolbar />
      <List sx={{ px: 1.5, py: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (!isDesktop) onClose();
              }}
              sx={{ position: "relative", overflow: "hidden", py: 1 }}
              disableRipple
            >
              {isActive && (
                <Box
                  component={motion.div}
                  layoutId="sidebar-active-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 3,
                    bgcolor: (t) =>
                      t.palette.mode === "dark" ? "rgba(0,113,227,0.22)" : "rgba(0,113,227,0.1)",
                  }}
                />
              )}
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  zIndex: 1,
                  color: isActive ? "primary.main" : "text.secondary",
                  transition: "color 0.2s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{ zIndex: 1 }}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "primary.main" : "text.primary",
                  fontSize: "0.925rem",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box", border: "none" },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box", border: "none" },
      }}
    >
      {content}
    </Drawer>
  );
}

export { DRAWER_WIDTH };
