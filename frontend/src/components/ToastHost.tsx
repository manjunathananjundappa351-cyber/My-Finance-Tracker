import { Alert, Button, Snackbar } from "@mui/material";

import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { hideToast } from "@/store/toastSlice";
import { runToastAction } from "@/store/toastActionRegistry";

export function ToastHost() {
  const dispatch = useAppDispatch();
  const { open, message, severity, actionLabel } = useAppSelector((state) => state.toast);

  return (
    <Snackbar
      open={open}
      autoHideDuration={actionLabel ? 8000 : 4000}
      onClose={() => dispatch(hideToast())}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={() => dispatch(hideToast())}
        severity={severity}
        variant="filled"
        sx={{ borderRadius: 2 }}
        action={
          actionLabel ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                runToastAction();
                dispatch(hideToast());
              }}
            >
              {actionLabel}
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
