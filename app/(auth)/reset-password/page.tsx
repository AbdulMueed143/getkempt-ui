import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set New Password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-serif text-2xl text-soft-ivory">Invalid link.</p>
        <p className="text-cool-gray text-sm">
          This password reset link is invalid or has expired.
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
