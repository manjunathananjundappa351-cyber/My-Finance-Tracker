import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useCallback, useState } from "react";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  resolve?: (result: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, title: "", message: "" });

  const confirm = useCallback((title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false }));
  };

  const ConfirmDialog = (
    <Dialog open={state.open} onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{state.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{state.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => handleClose(true)}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { confirm, ConfirmDialog };
}
