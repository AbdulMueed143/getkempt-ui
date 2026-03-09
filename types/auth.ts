export type UserRole = "barber" | "salon_owner" | "admin";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  businessName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/* ── Form value shapes (inferred from Zod, re-exported for consumers) ── */
export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
