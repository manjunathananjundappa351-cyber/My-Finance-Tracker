import { Box, Toolbar } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { CommandPalette } from "@/components/CommandPalette";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export function MainLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box display="flex">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette />
      <Box component="main" flexGrow={1} p={3} minHeight="100vh" bgcolor="background.default">
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
