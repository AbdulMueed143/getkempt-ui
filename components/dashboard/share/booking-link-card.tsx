"use client";

import { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Check,
  Copy,
  Share2,
  MessageCircle,
  Facebook,
  Mail,
  Link2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { slugify } from "@/lib/utils/slug";
import { bookingUrl } from "@/lib/config/booking";
import { MOCK_STORE_PROFILE } from "@/lib/mock/store-profile";

export function BookingLinkCard() {
  const [copied, setCopied] = useState(false);

  // TODO(api): derive the slug from the authenticated business profile.
  const slug = useMemo(() => slugify(MOCK_STORE_PROFILE.shopName), []);
  const url = useMemo(() => bookingUrl(slug), [slug]);
  const displayUrl = url.replace(/^https?:\/\//, "");

  const shareText = `Book your next appointment with ${MOCK_STORE_PROFILE.shopName} online:`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: MOCK_STORE_PROFILE.shopName, text: shareText, url });
      } catch {
        /* user cancelled */
      }
    } else {
      void copyLink();
    }
  }

  function downloadQr() {
    const canvas = document.getElementById("booking-qr") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${slug}-booking-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const socials = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      className: "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      className: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(`Book with ${MOCK_STORE_PROFILE.shopName}`)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`,
      className: "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200",
    },
  ];

  return (
    <div className="card-surface p-5 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Left — copy + actions */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-subtle text-royal-indigo">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-ink-900">Your booking link</h3>
              <p className="text-xs text-ink-400">
                Share it on socials so clients can book you 24/7.
              </p>
            </div>
          </div>

          {/* URL + copy */}
          <div className="mt-4 flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border-soft bg-card-tint px-3.5 py-2.5">
              <span className="truncate text-sm font-medium text-ink-700">
                {displayUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-all",
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-royal-indigo text-white hover:bg-indigo-hover"
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Share row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={nativeShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-ink-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-colors",
                  s.className
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right — QR */}
        <div className="flex shrink-0 flex-col items-center gap-2 border-t border-border-soft pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-border-soft">
            <QRCodeCanvas
              id="booking-qr"
              value={url}
              size={112}
              fgColor="#1B3163"
              bgColor="#FFFFFF"
              level="M"
            />
          </div>
          <button
            type="button"
            onClick={downloadQr}
            className="inline-flex items-center gap-1 text-xs font-semibold text-royal-indigo hover:underline"
          >
            <Download className="h-3 w-3" />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
