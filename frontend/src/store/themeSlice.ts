import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Mode = "light" | "dark";
export type AccentColor = "blue" | "emerald" | "purple" | "midnight";
export type FontScale = "normal" | "large" | "larger";

const MODE_KEY = "finance_tracker_theme_mode";
const ACCENT_KEY = "finance_tracker_accent_color";
const FONT_SCALE_KEY = "finance_tracker_font_scale";
const HIGH_CONTRAST_KEY = "finance_tracker_high_contrast";

function getInitialMode(): Mode {
  return localStorage.getItem(MODE_KEY) === "dark" ? "dark" : "light";
}

function getInitialAccent(): AccentColor {
  const stored = localStorage.getItem(ACCENT_KEY);
  return stored === "emerald" || stored === "purple" || stored === "midnight" ? stored : "blue";
}

function getInitialFontScale(): FontScale {
  const stored = localStorage.getItem(FONT_SCALE_KEY);
  return stored === "large" || stored === "larger" ? stored : "normal";
}

function getInitialHighContrast(): boolean {
  return localStorage.getItem(HIGH_CONTRAST_KEY) === "1";
}

interface ThemeState {
  mode: Mode;
  accentColor: AccentColor;
  fontScale: FontScale;
  highContrast: boolean;
}

const initialState: ThemeState = {
  mode: getInitialMode(),
  accentColor: getInitialAccent(),
  fontScale: getInitialFontScale(),
  highContrast: getInitialHighContrast(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem(MODE_KEY, state.mode);
    },
    setAccentColor: (state, action: PayloadAction<AccentColor>) => {
      state.accentColor = action.payload;
      localStorage.setItem(ACCENT_KEY, action.payload);
    },
    setFontScale: (state, action: PayloadAction<FontScale>) => {
      state.fontScale = action.payload;
      localStorage.setItem(FONT_SCALE_KEY, action.payload);
    },
    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.highContrast = action.payload;
      localStorage.setItem(HIGH_CONTRAST_KEY, action.payload ? "1" : "0");
    },
  },
});

export const { toggleTheme, setAccentColor, setFontScale, setHighContrast } = themeSlice.actions;
export default themeSlice.reducer;
