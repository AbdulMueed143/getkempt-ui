"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordSchema) => {
    await resetPassword(values.password, token);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-soft-ivory leading-tight">New password.</h1>
        <p className="text-cool-gray text-sm leading-relaxed">
          Make it strong — at least 8 characters, one uppercase, one number.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          label="New password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          leftAddon={<Lock size={16} />}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-royal-indigo/50 hover:text-royal-indigo transition-colors"
              aria-label={showPassword ? "Hide" : "Show"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        <FormField
          label="Confirm new password"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          leftAddon={<Lock size={16} />}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-royal-indigo/50 hover:text-royal-indigo transition-colors"
              aria-label={showConfirm ? "Hide" : "Show"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Update password
        </Button>
      </form>

      {/* Trust signal */}
      <div className="flex items-center justify-center gap-2 text-white/25">
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[11px]">Your password is encrypted end-to-end</span>
      </div>
    </div>
  );
}
