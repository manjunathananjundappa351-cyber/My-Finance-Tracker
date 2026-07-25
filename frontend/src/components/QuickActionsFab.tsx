import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  { icon: <PaidIcon fontSize="small" />, name: "Add Expense", path: "/expenses" },
  { icon: <AccountBalanceWalletIcon fontSize="small" />, name: "Add Income", path: "/income" },
  { icon: <TrendingUpIcon fontSize="small" />, name: "Add Holding", path: "/portfolio" },
  { icon: <FlagOutlinedIcon fontSize="small" />, name: "Add Goal", path: "/goals" },
  { icon: <CreditCardOutlinedIcon fontSize="small" />, name: "Add Loan", path: "/loans" },
];

export function QuickActionsFab() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <SpeedDial
      ariaLabel="Quick actions"
      icon={<SpeedDialIcon icon={<AddIcon />} />}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      sx={{ position: "fixed", bottom: 24, right: 24 }}
    >
      {ACTIONS.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={() => {
            setOpen(false);
            navigate(`${action.path}?quickAdd=1`);
          }}
        />
      ))}
    </SpeedDial>
  );
}
