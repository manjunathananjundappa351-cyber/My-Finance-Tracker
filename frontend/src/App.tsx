import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";

import { ToastHost } from "@/components/ToastHost";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { router } from "@/router";
import { createAppTheme } from "@/theme";

export function App() {
  const mode = useAppSelector((state) => state.theme.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <ToastHost />
    </ThemeProvider>
  );
}
