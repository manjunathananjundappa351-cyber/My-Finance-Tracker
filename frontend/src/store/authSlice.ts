import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { authApi } from "@/api/authApi";
import { tokenStorage } from "@/api/axios";
import { LoginPayload, RegisterPayload, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload);
    tokenStorage.setTokens(tokens);
    return authApi.me();
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload) => {
    await authApi.register(payload);
    const tokens = await authApi.login({
      email: payload.email,
      password: payload.password,
    });
    tokenStorage.setTokens(tokens);
    return authApi.me();
  }
);

export const fetchCurrentUser = createAsyncThunk("auth/me", async () => {
  return authApi.me();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      tokenStorage.clear();
      state.user = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Registration failed";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
