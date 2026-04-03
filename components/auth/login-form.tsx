"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ROUTES } from "@/constants/routes";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-soft-ivory leading-tight">
          Welcome back.
        </h1>
        <p className="text-cool-gray text-sm leading-relaxed">
          Sign in to your Get Kempt account and get back to what matters.
        </p>
      </div>

      {/* Server error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(login)} className="space-y-5" noValidate>
        <FormField
          label="Email address"
          type="email"
          placeholder="you@yourbusiness.com.au"
          autoComplete="email"
          required
          leftAddon={<Mail size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1">
          <FormField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            leftAddon={<Lock size={16} />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-royal-indigo/50 hover:text-royal-indigo transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-[#C4A882] hover:text-[#D5C4A8] transition-colors duration-300"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Checkbox
          label="Keep me signed in"
          {...register("rememberMe")}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      {/* Trust signal */}
      <div className="flex items-center justify-center gap-2 text-white/25">
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[11px]">Your data is encrypted and secure</span>
      </div>

      {/* Divider */}
      <div className="relative flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#C4A882]/10" />
        <span className="text-cool-gray text-xs shrink-0">or</span>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#C4A882]/10" />
      </div>

      <p className="text-center text-sm text-cool-gray">
        New to Get Kempt?{" "}
        <Link
          href={ROUTES.SIGNUP}
          className="text-[#C4A882] hover:text-[#D5C4A8] font-medium transition-colors duration-300"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
