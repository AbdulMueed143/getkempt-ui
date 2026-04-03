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
      <div className="relative flex flex-col justify-center items-center min-h-screen bg-midnight-navy px-6 py-12 lg:px-10 overflow-hidden">
        {/* Subtle warm ambient glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C4A882]/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#1B3163]/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Subtle noise grain */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Gold accent line at left edge (visible on desktop) */}
        <div className="hidden lg:block absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#C4A882]/10 to-transparent pointer-events-none" />

        {/* Mobile-only logo */}
        <div className="lg:hidden mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-soft-ivory">Get Kempt</span>
            <span className="text-[#C4A882] text-xl">.</span>
          </div>
        </div>

        {/* Form slot */}
        <div className="relative z-10 w-full max-w-[420px]">{children}</div>

        {/* Footer */}
        <div className="relative z-10 mt-10 text-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent mx-auto mb-3" />
          <p className="text-xs text-cool-gray">
            © {new Date().getFullYear()} Get Kempt. Proudly built in Melbourne.
          </p>
        </div>
      </div>
    </div>
  );
}
