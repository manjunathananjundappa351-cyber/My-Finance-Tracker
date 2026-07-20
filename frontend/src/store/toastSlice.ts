import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Severity = "success" | "error" | "info" | "warning";

interface ToastState {
  open: boolean;
  message: string;
  severity: Severity;
  actionLabel?: string;
}

const initialState: ToastState = { open: false, message: "", severity: "success" };

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{ message: string; severity?: Severity; actionLabel?: string }>
    ) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity ?? "success";
      state.actionLabel = action.payload.actionLabel;
    },
    hideToast: (state) => {
      state.open = false;
      state.actionLabel = undefined;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
