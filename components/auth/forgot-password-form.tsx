"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { forgotPassword, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordSchema) => {
    const ok = await forgotPassword(values.email);
    if (ok) {
      setSubmittedEmail(values.email);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-warm-sand/10 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-warm-sand" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-soft-ivory">Check your inbox.</h1>
          <p className="text-cool-gray text-sm leading-relaxed">
            We sent a reset link to{" "}
            <span className="text-soft-ivory font-medium">{submittedEmail}</span>.
            It expires in 15 minutes.
          </p>
        </div>
        <p className="text-xs text-cool-gray">
          Didn&apos;t receive it?{" "}
          <button
            onClick={() => setSent(false)}
            className="text-warm-sand hover:underline"
          >
            Resend the link
          </button>
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="block text-sm text-cool-gray hover:text-soft-ivory transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl text-soft-ivory">Reset password.</h1>
        <p className="text-cool-gray text-sm leading-relaxed">
          Enter your email and we&apos;ll send you a link to get back in.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Send reset link
        </Button>
      </form>

      <Link
        href={ROUTES.LOGIN}
        className="block text-center text-sm text-cool-gray hover:text-soft-ivory transition-colors"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}
