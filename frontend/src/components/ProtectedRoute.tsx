import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { Loader } from "@/components/Loader";
import { tokenStorage } from "@/api/axios";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchCurrentUser } from "@/store/authSlice";

export function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "idle" && tokenStorage.getAccessToken()) {
      dispatch(fetchCurrentUser());
    }
  }, [status, dispatch]);

  if (!tokenStorage.getAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  if (status === "idle" || status === "loading") {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
