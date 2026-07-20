import { Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
      gap={2}
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Typography variant="h1" fontWeight={700} sx={{ fontSize: { xs: 72, sm: 96 } }}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary">
        This page doesn&apos;t exist.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
}
