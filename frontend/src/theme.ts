import { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/material/styles";

const APPLE_BLUE = "#0071e3";
const APPLE_GREEN = "#28cd41";
const APPLE_RED = "#ff3b30";

const FONT_STACK =
  '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const glassBg = isDark ? "rgba(22,22,23,0.72)" : "rgba(251,251,253,0.75)";

  return createTheme({
    palette: {
      mode,
      primary: { main: APPLE_BLUE },
      success: { main: APPLE_GREEN },
      error: { main: APPLE_RED },
      background: {
        default: isDark ? "#000000" : "#fbfbfd",
        paper: isDark ? "#1d1d1f" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f5f5f7" : "#1d1d1f",
        secondary: isDark ? "rgba(245,245,247,0.65)" : "#6e6e73",
      },
      divider: borderColor,
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: FONT_STACK,
      h1: { fontWeight: 700, letterSpacing: "-0.03em" },
      h2: { fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700, letterSpacing: "-0.015em" },
      h5: { fontWeight: 600, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600, letterSpacing: "-0.005em" },
      button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
      body1: { letterSpacing: "-0.005em" },
      body2: { letterSpacing: "-0.005em" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 980,
            paddingInline: 22,
            paddingBlock: 10,
            transition: "transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s cubic-bezier(.4,0,.2,1), background-color 0.2s ease",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: isDark
                ? "0 8px 24px rgba(0,113,227,0.45)"
                : "0 8px 20px rgba(0,113,227,0.28)",
              transform: "translateY(-1px)",
            },
            "&:active": { transform: "translateY(0)" },
          },
          outlined: {
            borderColor,
            "&:hover": { borderColor: APPLE_BLUE, backgroundColor: "transparent" },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: {
            borderColor,
            borderRadius: 20,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${borderColor}`,
            transition: "transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s cubic-bezier(.4,0,.2,1), border-color 0.3s ease",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            backgroundColor: glassBg,
            boxShadow: "none",
            borderBottom: `1px solid ${borderColor}`,
            color: isDark ? "#f5f5f7" : "#1d1d1f",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: glassBg,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderRight: `1px solid ${borderColor}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${isDark ? "rgba(0,113,227,0.25)" : "rgba(0,113,227,0.14)"}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: "background-color 0.2s ease",
          },
        },
      },
    },
  });
}
