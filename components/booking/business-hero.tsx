import { MapPin, Star, Phone, Globe } from "lucide-react";
import { BUSINESS_TYPE_LABELS } from "@/types/store-profile";
import type { BusinessPublicProfile } from "@/types/public-booking";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function BusinessHero({ business }: { business: BusinessPublicProfile }) {
  const { address } = business;
  const locationLine = [address.suburb, address.state].filter(Boolean).join(", ");

  return (
    <header className="relative overflow-hidden">
      {/* Brand band */}
      <div className="bg-deep-navy noise-overlay relative">
        <div className="relative z-10 mx-auto max-w-5xl px-5 pt-10 pb-14 sm:pt-14 sm:pb-20">
          <div className="flex items-center gap-4 sm:gap-5">
            {business.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo}
                alt={business.shopName}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-2 ring-warm-sand/30 shrink-0"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-warm-sand/15 ring-2 ring-warm-sand/30 flex items-center justify-center shrink-0">
                <span className="heading-serif text-2xl sm:text-3xl text-warm-sand">
                  {initials(business.shopName)}
                </span>
              </div>
            )}

            <div className="min-w-0">
              <p className="text-warm-sand/80 text-xs font-semibold uppercase tracking-widest mb-1">
                {BUSINESS_TYPE_LABELS[business.businessType]}
              </p>
              <h1 className="heading-serif text-2xl sm:text-4xl text-soft-ivory leading-tight truncate">
                {business.shopName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-mist-blue">
                {business.rating != null && (
                  <span className="inline-flex items-center gap-1 text-warm-sand-light">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-semibold text-soft-ivory">
                      {business.rating.toFixed(1)}
                    </span>
                    {business.reviewCount != null && (
                      <span className="text-mist-blue">({business.reviewCount})</span>
                    )}
                  </span>
                )}
                {locationLine && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {locationLine}
                  </span>
                )}
                {business.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {business.phone}
                  </span>
                )}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-warm-sand transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {business.description && (
            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-soft-ivory/70">
              {business.description}
            </p>
          )}
        </div>
      </div>

      {/* Warm curve into the light content */}
      <div className="h-6 bg-app-bg rounded-t-[28px] -mt-6 relative z-10" />
    </header>
  );
}
