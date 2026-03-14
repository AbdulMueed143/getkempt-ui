"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import type { StoreAddress } from "@/types/store-profile";

interface MapPreviewProps {
  address: StoreAddress;
}

function buildAddressString(a: StoreAddress): string {
  return [a.line1, a.line2, a.suburb, a.state, a.postcode, a.country]
    .filter(Boolean)
    .join(", ");
}

function buildEmbedUrl(addressStr: string): string {
  const encoded = encodeURIComponent(addressStr);
  // Uses the no-key Maps embed — for production replace with the Places Embed API URL
  // and set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encoded}&zoom=15`;
  }
  return `https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

function buildDirectionsUrl(addressStr: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`;
}

export function MapPreview({ address }: MapPreviewProps) {
  const hasAddress = address.line1 && address.suburb;
  const addressStr = buildAddressString(address);

  const [confirmedAddress, setConfirmedAddress] = useState(
    hasAddress ? addressStr : ""
  );
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-preview when the address changes (debounced)
  useEffect(() => {
    if (!hasAddress) return;
    const timer = setTimeout(() => {
      setLoading(true);
      setConfirmedAddress(addressStr);
    }, 800);
    return () => clearTimeout(timer);
  }, [addressStr, hasAddress]);

  function handleIframeLoad() {
    setLoading(false);
  }

  if (!confirmedAddress) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 h-56 text-center px-4">
        <MapPin className="w-8 h-8 text-gray-300" />
        <p className="text-sm text-gray-400">
          Enter your address above to preview the map
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-gray-200 h-56 bg-gray-100">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <Loader2 className="w-6 h-6 text-[#1B3163] animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={buildEmbedUrl(confirmedAddress)}
          title="Shop location map"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleIframeLoad}
        />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#1B3163] mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 truncate">{confirmedAddress}</p>
        </div>
        <a
          href={buildDirectionsUrl(confirmedAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#1B3163] font-medium hover:underline shrink-0"
        >
          Open in Maps
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
