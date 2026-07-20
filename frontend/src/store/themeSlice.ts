import { createSlice } from "@reduxjs/toolkit";

type Mode = "light" | "dark";

const STORAGE_KEY = "finance_tracker_theme_mode";

function getInitialMode(): Mode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: getInitialMode() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, state.mode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
