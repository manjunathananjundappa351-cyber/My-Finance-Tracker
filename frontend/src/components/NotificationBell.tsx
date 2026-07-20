import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { notificationApi } from "@/api/notificationApi";
import { AppNotification } from "@/types/notification";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  function load() {
    notificationApi.list().then(setNotifications).catch(() => undefined);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleMarkRead(notification: AppNotification) {
    if (notification.is_read) return;
    await notificationApi.markRead(notification.id);
    load();
  }

  async function handleMarkAllRead() {
    await notificationApi.markAllRead();
    load();
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsNoneIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 420 } } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllRead}>
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="You're all caught up." />
          </MenuItem>
        ) : (
          notifications.slice(0, 15).map((n) => (
            <MenuItem key={n.id} onClick={() => handleMarkRead(n)} sx={{ whiteSpace: "normal" }}>
              <ListItemText
                primary={n.message}
                secondary={timeAgo(n.created_at)}
                primaryTypographyProps={{
                  fontWeight: n.is_read ? 400 : 600,
                  variant: "body2",
                }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
