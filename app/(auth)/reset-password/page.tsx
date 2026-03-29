"use client";

/**
 * Static-export compatible reset-password page.
 *
 * Reads `?token=` from the URL on the client using useSearchParams()
 * instead of the server-side searchParams prop. This allows Next.js to
 * pre-render the page as a static shell and avoids the ƒ (dynamic) flag
 * that breaks `output: 'export'`.
 *
 * The Suspense boundary is required whenever useSearchParams() is used
 * in a Client Component — Next.js enforces this at build time.
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token  = params.get("token") ?? undefined;

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 text-center">
          <p className="font-serif text-2xl text-soft-ivory">Loading…</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
