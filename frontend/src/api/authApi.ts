import { apiClient } from "@/api/axios";
import { LoginPayload, RegisterPayload, TokenPair, User } from "@/types/auth";

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<User>("/auth/register", payload).then((res) => res.data),

  login: (payload: LoginPayload) =>
    apiClient.post<TokenPair>("/auth/login", payload).then((res) => res.data),

  me: () => apiClient.get<User>("/auth/me").then((res) => res.data),

  updateProfile: (full_name: string) =>
    apiClient.put<User>("/auth/me", { full_name }).then((res) => res.data),

  changePassword: (current_password: string, new_password: string) =>
    apiClient.post("/auth/change-password", { current_password, new_password }),
};
