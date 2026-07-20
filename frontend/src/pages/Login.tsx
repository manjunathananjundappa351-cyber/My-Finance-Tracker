import { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Alert, Box, Button, Link, TextField } from "@mui/material";
import { motion, Variants } from "framer-motion";

import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { login } from "@/store/authSlice";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate("/");
    }
  }

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
        {error && (
          <motion.div variants={item}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </motion.div>
        )}
        <motion.div variants={item}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
        </motion.div>
        <motion.div variants={item}>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
        </motion.div>
        <motion.div variants={item}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={status === "loading"}
          >
            {status === "loading" ? "Logging in…" : "Log in"}
          </Button>
        </motion.div>
        <motion.div variants={item}>
          <Box textAlign="center">
            <Link component={RouterLink} to="/register" variant="body2">
              Don&apos;t have an account? Register
            </Link>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
