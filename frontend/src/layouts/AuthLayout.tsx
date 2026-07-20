import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

const EASE = [0.22, 1, 0.36, 1] as const;

function GradientOrb({
  size,
  color,
  top,
  left,
  right,
  bottom,
  duration,
}: {
  size: number;
  color: string;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  duration: number;
}) {
  return (
    <Box
      component={motion.div}
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -30, 20, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      sx={{
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: "blur(60px)",
        pointerEvents: "none",
      }}
    />
  );
}

export function AuthLayout() {
  return (
    <Box display="flex" minHeight="100vh" sx={{ backgroundColor: "background.default" }}>
      <Box
        flex={1}
        display={{ xs: "none", md: "flex" }}
        position="relative"
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        sx={{
          background: "linear-gradient(160deg, #000000 0%, #050914 45%, #001d3d 100%)",
        }}
      >
        <GradientOrb size={520} color="rgba(0,113,227,0.5)" top="-8%" left="-10%" duration={20} />
        <GradientOrb size={420} color="rgba(88,86,214,0.4)" bottom="-10%" right="-8%" duration={26} />
        <GradientOrb size={300} color="rgba(40,205,65,0.22)" top="35%" right="10%" duration={18} />

        <Stack
          spacing={3}
          maxWidth={460}
          px={6}
          position="relative"
          zIndex={1}
          component={motion.div}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            letterSpacing="-0.03em"
            lineHeight={1.15}
            sx={{ color: "#f5f5f7" }}
          >
            Your money.
            <br />
            Beautifully organized.
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(245,245,247,0.68)" }}>
            Track spending, income, and investments in one focused view — built for clarity,
            designed for the long run.
          </Typography>
        </Stack>
      </Box>

      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        sx={{ backgroundColor: "background.default" }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          width="100%"
          maxWidth={400}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            mb={4}
            textAlign={{ xs: "center", md: "left" }}
          >
            My Finance Tracker
          </Typography>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
