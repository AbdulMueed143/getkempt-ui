"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, Building2, Shield, Sparkles } from "lucide-react";
import { signupSchema, type SignupSchema } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/use-auth";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";

const ROLE_OPTIONS = [
  { value: "barber", label: "Barber / Hairdresser" },
  { value: "salon_owner", label: "Business Owner / Manager" },
];

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signup, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: { agreeToTerms: undefined },
  });

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#C4A882]/10 border border-[#C4A882]/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A882]" />
          </div>
          <span className="text-xs text-[#C4A882] font-medium tracking-wider uppercase">Free for 30 days</span>
        </div>
        <h1 className="font-serif text-3xl text-soft-ivory leading-tight">
          Join Get Kempt.
        </h1>
        <p className="text-cool-gray text-sm leading-relaxed">
          For barbershops, salons, studios & beyond — set up in minutes.
        </p>
      </div>

      {/* Server error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(signup)} className="space-y-4" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="First name"
            placeholder="Alex"
            autoComplete="given-name"
            required
            leftAddon={<User size={16} />}
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <FormField
            label="Last name"
            placeholder="Smith"
            autoComplete="family-name"
            required
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <FormField
          label="Email address"
          type="email"
          placeholder="you@yoursalon.com.au"
          autoComplete="email"
          required
          leftAddon={<Mail size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          label="Business / shop name"
          placeholder="e.g. Cuts & Co., Glow Studio, The Nail Bar..."
          required
          leftAddon={<Building2 size={16} />}
          error={errors.businessName?.message}
          {...register("businessName")}
        />

        {/* Role select */}
        <div className="flex flex-col">
          <Label required>My role</Label>
          <Select
            options={ROLE_OPTIONS}
            placeholder="Select your role..."
            hasError={!!errors.role}
            {...register("role")}
          />
          {errors.role && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <span>⚠</span> {errors.role.message}
            </p>
          )}
        </div>

        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          autoComplete="new-password"
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

        <FormField
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          leftAddon={<Lock size={16} />}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-royal-indigo/50 hover:text-royal-indigo transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Checkbox
          hasError={!!errors.agreeToTerms}
          label={
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-[#C4A882] hover:text-[#D5C4A8] hover:underline transition-colors duration-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#C4A882] hover:text-[#D5C4A8] hover:underline transition-colors duration-300">
                Privacy Policy
              </Link>
            </span>
          }
          {...register("agreeToTerms")}
        />
        {errors.agreeToTerms && (
          <p className="text-xs text-red-400 flex items-center gap-1 -mt-2">
            <span>⚠</span> {errors.agreeToTerms.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-4 text-white/20">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[11px]">Encrypted & secure</span>
        </div>
        <div className="w-[1px] h-3 bg-white/10" />
        <span className="text-[11px]">No credit card required</span>
      </div>

      <p className="text-center text-sm text-cool-gray">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-[#C4A882] hover:text-[#D5C4A8] font-medium transition-colors duration-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
