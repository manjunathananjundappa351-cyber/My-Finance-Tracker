import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode, useRef, useState } from "react";

import { authApi } from "@/api/authApi";
import { backupApi } from "@/api/backupApi";
import { LoadingButton } from "@/components/LoadingButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useConfirm } from "@/hooks/useConfirm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { extractErrorMessage, useToast } from "@/hooks/useToast";
import { fetchCurrentUser } from "@/store/authSlice";
import { AccentColor, FontScale, setAccentColor, setFontScale, setHighContrast, toggleTheme } from "@/store/themeSlice";

const EASE = [0.22, 1, 0.36, 1] as const;

const ACCENT_OPTIONS: { key: AccentColor; label: string; color: string }[] = [
  { key: "blue", label: "Blue", color: "#0071e3" },
  { key: "emerald", label: "Emerald", color: "#10b981" },
  { key: "purple", label: "Purple", color: "#8b5cf6" },
  { key: "midnight", label: "Midnight", color: "#4f46e5" },
];

function Section({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      variant="outlined"
      sx={{ p: 3 }}
    >
      {children}
    </Paper>
  );
}

export function Settings() {
  useDocumentTitle("Settings");
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { confirm, ConfirmDialog } = useConfirm();
  const user = useAppSelector((state) => state.auth.user);
  const { mode, accentColor, fontScale, highContrast } = useAppSelector((state) => state.theme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState(0);

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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

  async function handleExport() {
    setExporting(true);
    try {
      const data = await backupApi.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `my-finance-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not export backup"));
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(file: File) {
    const ok = await confirm(
      "Restore from backup?",
      "This will add every record from the backup file to your account (existing data is kept, nothing is overwritten)."
    );
    if (!ok) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const summary = await backupApi.restore(data);
      toast.success(
        `Restored ${summary.expenses_imported} expenses, ${summary.income_imported} income, ${summary.portfolio_holdings_imported} holdings`
      );
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore backup - check the file is valid"));
    } finally {
      setImporting(false);
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap={3} maxWidth={620}>
      <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
        Settings
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Profile" />
        <Tab label="Appearance" />
        <Tab label="Security" />
        <Tab label="Data" />
      </Tabs>

      {tab === 0 && (
        <Section delay={0}>
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
              <LoadingButton variant="contained" loading={savingProfile} onClick={handleSaveProfile}>
                Save profile
              </LoadingButton>
            </Box>
          </Stack>
        </Section>
      )}

      {tab === 1 && (
        <Section delay={0}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Appearance
          </Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Theme
              </Typography>
              <Button
                variant="outlined"
                startIcon={mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                onClick={() => dispatch(toggleTheme())}
              >
                Switch to {mode === "dark" ? "light" : "dark"} mode
              </Button>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Accent Color
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {ACCENT_OPTIONS.map((opt) => (
                  <Tooltip key={opt.key} title={opt.label}>
                    <Box
                      component="button"
                      aria-label={`Use ${opt.label} accent color`}
                      onClick={() => dispatch(setAccentColor(opt.key))}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: opt.color,
                        border: accentColor === opt.key ? "3px solid" : "1px solid",
                        borderColor: accentColor === opt.key ? "text.primary" : "divider",
                        cursor: "pointer",
                        p: 0,
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Box>

            <TextField
              select
              label="Font Size"
              value={fontScale}
              onChange={(e) => dispatch(setFontScale(e.target.value as FontScale))}
              sx={{ maxWidth: 240 }}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="large">Large</MenuItem>
              <MenuItem value="larger">Larger</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={highContrast}
                  onChange={(e) => dispatch(setHighContrast(e.target.checked))}
                />
              }
              label="High contrast (stronger borders and text contrast)"
            />
          </Stack>
        </Section>
      )}

      {tab === 2 && (
        <Section delay={0}>
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
        </Section>
      )}

      {tab === 3 && (
        <Section delay={0}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Backup &amp; Restore
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Export downloads everything in your account as a single JSON file. Restoring adds the
            contents of a backup file to your account - it never overwrites or deletes existing data.
          </Alert>
          <Stack direction="row" spacing={2}>
            <LoadingButton
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              loading={exporting}
              onClick={handleExport}
            >
              Export backup
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              startIcon={<UploadOutlinedIcon />}
              loading={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              Restore from file
            </LoadingButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = "";
              }}
            />
          </Stack>
        </Section>
      )}
      {ConfirmDialog}
    </Box>
  );
}
