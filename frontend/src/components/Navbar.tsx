import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";

import { NotificationBell } from "@/components/NotificationBell";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { logout } from "@/store/authSlice";
import { toggleTheme } from "@/store/themeSlice";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" noWrap component="div" fontWeight={700} sx={{ flexGrow: 1 }}>
          My Finance Tracker
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
          <NotificationBell />
          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => dispatch(toggleTheme())}
            >
              {mode === "dark" ? (
                <LightModeOutlinedIcon fontSize="small" />
              ) : (
                <DarkModeOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          {user && (
            <Typography
              variant="body2"
              color="text.secondary"
              mx={1}
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              {user.full_name}
            </Typography>
          )}
          <Tooltip title="Logout">
            <IconButton aria-label="Logout" onClick={() => dispatch(logout())}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
