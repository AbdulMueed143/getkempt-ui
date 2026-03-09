"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";
import type { LoginSchema, SignupSchema } from "@/lib/validations/auth";

/**
 * useAuth — single hook for all auth operations.
 *
 * Keeps page components free of store/router coupling.
 * Swap out the TODO stubs below with real API calls when the backend is ready.
 */
export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, setUser, setLoading, setError, clearError, logout } =
    useAuthStore();

  const login = useCallback(
    async (values: LoginSchema) => {
      setLoading(true);
      clearError();
      try {
        // TODO: replace with API call → lib/api/auth.ts
        await new Promise((r) => setTimeout(r, 800));
        setUser(
          {
            id: "mock-1",
            email: values.email,
            firstName: "Demo",
            lastName: "User",
            role: "barber",
            createdAt: new Date().toISOString(),
          },
          { accessToken: "mock-access", refreshToken: "mock-refresh" }
        );
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      }
    },
    [router, setUser, setLoading, setError, clearError]
  );

  const signup = useCallback(
    async (values: SignupSchema) => {
      setLoading(true);
      clearError();
      try {
        // TODO: replace with API call → lib/api/auth.ts
        await new Promise((r) => setTimeout(r, 800));
        setUser(
          {
            id: "mock-2",
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            role: values.role,
            businessName: values.businessName,
            createdAt: new Date().toISOString(),
          },
          { accessToken: "mock-access", refreshToken: "mock-refresh" }
        );
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      }
    },
    [router, setUser, setLoading, setError, clearError]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      setLoading(true);
      clearError();
      try {
        // TODO: replace with API call
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed. Please try again.");
        return false;
      }
    },
    [setLoading, setError, clearError]
  );

  const resetPassword = useCallback(
    async (password: string, token: string) => {
      setLoading(true);
      clearError();
      try {
        // TODO: replace with API call
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        router.push(ROUTES.LOGIN);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reset failed. Please try again.");
        return false;
      }
    },
    [router, setLoading, setError, clearError]
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push(ROUTES.LOGIN);
  }, [logout, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    clearError,
    login,
    signup,
    forgotPassword,
    resetPassword,
    logout: handleLogout,
  };
}
