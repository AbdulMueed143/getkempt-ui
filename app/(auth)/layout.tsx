import type { Metadata } from "next";
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel";

export const metadata: Metadata = {
  title: {
    default: "Get Kempt",
    template: "%s | Get Kempt",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_560px]">
      {/* ── Left: Brand panel ─── */}
      <AuthBrandPanel />

      {/* ── Right: Form panel ─── */}
      <div className="flex flex-col justify-center items-center min-h-screen bg-midnight-navy px-6 py-12 lg:px-10">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-soft-ivory">Get Kempt</span>
            <span className="text-warm-sand text-xl">.</span>
          </div>
        </div>

        {/* Form slot */}
        <div className="w-full max-w-[420px]">{children}</div>

        {/* Footer */}
        <p className="mt-10 text-xs text-cool-gray text-center">
          © {new Date().getFullYear()} Get Kempt. Proudly built in Melbourne.
        </p>
      </div>
    </div>
  );
}
