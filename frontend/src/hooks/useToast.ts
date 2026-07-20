import { useCallback } from "react";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { showToast } from "@/store/toastSlice";
import { setToastAction } from "@/store/toastActionRegistry";

export function useToast() {
  const dispatch = useAppDispatch();

  const success = useCallback(
    (message: string) => {
      setToastAction(null);
      dispatch(showToast({ message, severity: "success" }));
    },
    [dispatch]
  );
  const error = useCallback(
    (message: string) => {
      setToastAction(null);
      dispatch(showToast({ message, severity: "error" }));
    },
    [dispatch]
  );
  const info = useCallback(
    (message: string) => {
      setToastAction(null);
      dispatch(showToast({ message, severity: "info" }));
    },
    [dispatch]
  );
  const successWithUndo = useCallback(
    (message: string, onUndo: () => void) => {
      setToastAction(onUndo);
      dispatch(showToast({ message, severity: "success", actionLabel: "Undo" }));
    },
    [dispatch]
  );

  return { success, error, info, successWithUndo };
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ===
      "string"
  ) {
    return (err as { response: { data: { detail: string } } }).response.data.detail;
  }
  return fallback;
}
