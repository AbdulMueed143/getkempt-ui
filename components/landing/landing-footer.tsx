import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Features",         href: "#features" },
      { label: "Pricing",          href: "#pricing" },
      { label: "How it works",     href: "#how-it-works" },
      { label: "Changelog",        href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us",         href: "#" },
      { label: "Blog",             href: "#" },
      { label: "Careers",          href: "#" },
      { label: "Contact",          href: "mailto:hello@getkempt.com" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy",   href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy",    href: "#" },
    ],
  },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/getkempt", icon: "📸" },
  { label: "TikTok",    href: "https://tiktok.com/@getkempt",   icon: "🎵" },
  { label: "Facebook",  href: "https://facebook.com/getkempt",  icon: "👍" },
];

export function LandingFooter() {
  return (
    <footer className="bg-[#080F18] border-t border-white/8 px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/assets/logo_partial_white.svg"
              alt="GetKempt"
              width={120}
              height={32}
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-white/40 leading-relaxed mb-5">
              The booking and management platform built for grooming businesses.
              Proudly made in Melbourne. 🇦🇺
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-9 h-9 bg-white/8 hover:bg-white/15 rounded-xl flex items-center justify-center text-base transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} GetKempt Pty Ltd · ABN XX XXX XXX XXX
          </p>
          <p className="text-xs text-white/25">
            Built in Melbourne with ☕ · All prices in AUD incl. GST
          </p>
        </div>
      </div>
    </footer>
  );
}
