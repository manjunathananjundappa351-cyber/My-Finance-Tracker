import { Box, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";

import { authApi } from "@/api/authApi";
import { LoadingButton } from "@/components/LoadingButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { fetchCurrentUser } from "@/store/authSlice";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Settings() {
  useDocumentTitle("Settings");
  const toast = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSaveProfile() {
    if (!fullName) return;
    setSavingProfile(true);
    try {
      await authApi.updateProfile(fullName);
      dispatch(fetchCurrentUser());
      toast.success("Profile updated");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update profile"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not change password"));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap={3} maxWidth={520}>
      <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
        Settings
      </Typography>

      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        variant="outlined"
        sx={{ p: 3 }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Profile
        </Typography>
        <Stack spacing={2}>
          <TextField label="Email" value={user?.email ?? ""} disabled fullWidth />
          <TextField
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
          />
          <Box>
            <LoadingButton
              variant="contained"
              loading={savingProfile}
              onClick={handleSaveProfile}
            >
              Save profile
            </LoadingButton>
          </Box>
        </Stack>
      </Paper>

      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: EASE }}
        variant="outlined"
        sx={{ p: 3 }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Change password
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="New password"
            type="password"
            helperText="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <Divider />
          <Box>
            <LoadingButton
              variant="contained"
              loading={savingPassword}
              onClick={handleChangePassword}
            >
              Update password
            </LoadingButton>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
