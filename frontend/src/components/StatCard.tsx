import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface StatCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  positive?: boolean;
  delay?: number;
}

export function StatCard({ label, value, format = (n) => n.toFixed(0), positive, delay = 0 }: StatCardProps) {
  const display = useAnimatedNumber(value);
  const color = positive === undefined ? "text.primary" : positive ? "success.main" : "error.main";

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      variant="outlined"
      sx={{ height: "100%" }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} color={color} letterSpacing="-0.02em">
          {format(display)}
        </Typography>
      </CardContent>
    </Card>
  );
}
