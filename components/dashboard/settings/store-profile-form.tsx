"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Store, Phone, Mail, Globe, MapPin,
  Instagram, Facebook, Save, AlertCircle,
  Building2, Camera, Share2, User,
} from "lucide-react";
import { storeProfileSchema, type StoreProfileSchema } from "@/lib/validations/store-profile";
import { MOCK_STORE_PROFILE } from "@/lib/mock/store-profile";
import { BUSINESS_TYPE_LABELS, AUSTRALIAN_STATES } from "@/types/store-profile";
import { MapPreview } from "./map-preview";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

/* ─────────────────────────────────────────────────
   Tab definitions — icon-only, no emojis.
   ───────────────────────────────────────────────── */
const TABS = [
  { id: "identity", label: "Identity", icon: User },
  { id: "contact",  label: "Contact",  icon: Phone },
  { id: "location", label: "Location", icon: MapPin },
  { id: "social",   label: "Social",   icon: Share2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─────────────────────────────────────────────────
   Field wrapper
   ───────────────────────────────────────────────── */
function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#0B1220] tracking-wide">
        {label}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[#6B7280] leading-relaxed">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-600 font-medium">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Input styling
   ───────────────────────────────────────────────── */
const inputClass = (hasError?: boolean) =>
  cn(
    "w-full text-sm text-[#0B1220] border rounded-xl px-3.5 py-2.5 bg-white transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40 focus:border-[#C4A882]",
    "placeholder:text-[#9CA3AF]",
    hasError
      ? "border-rose-300 bg-rose-50/40"
      : "border-[#E8E4DA] hover:border-[#C4A882]/40",
  );

const prefixInputClass = (hasError?: boolean) =>
  cn(inputClass(hasError), "pl-10");

/* ─────────────────────────────────────────────────
   Social handle prefix
   ───────────────────────────────────────────────── */
function SocialField({
  label,
  icon: Icon,
  prefix,
  placeholder,
  error,
  ...inputProps
}: {
  label: string;
  icon: React.ElementType;
  prefix: string;
  placeholder: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error}>
      <div
        className={cn(
          "flex items-stretch border rounded-xl overflow-hidden bg-white transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-[#C4A882]/40 focus-within:border-[#C4A882]",
          error ? "border-rose-300" : "border-[#E8E4DA] hover:border-[#C4A882]/40",
        )}
      >
        <div className="flex items-center gap-1.5 px-3 bg-[#FAF8F3] border-r border-[#E8E4DA] shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#4B5563] font-medium">{prefix}</span>
        </div>
        <input
          {...inputProps}
          placeholder={placeholder}
          className="flex-1 text-sm px-3 py-2.5 bg-transparent focus:outline-none placeholder:text-[#9CA3AF] text-[#0B1220]"
        />
      </div>
    </Field>
  );
}

/* ─────────────────────────────────────────────────
   Small section-card wrapper used in every tab.
   Consistent icon-tile look across every tab/section.
   ───────────────────────────────────────────────── */
function SectionCard({
  icon: Icon,
  title,
  description,
  accent = "#1B3163",
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        border: "1px solid #E8E4DA",
        boxShadow:
          "0 1px 2px rgba(11,18,32,0.04), 0 1px 3px rgba(11,18,32,0.04)",
      }}
    >
      <div
        className="px-5 py-4 border-b border-[#F0EEE6] flex items-center gap-3"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${accent}14`,
            border: `1px solid ${accent}30`,
          }}
        >
          <Icon size={17} strokeWidth={2.25} style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#0B1220] leading-tight">
            {title}
          </h3>
          <p className="text-[11px] text-[#6B7280] mt-0.5 font-medium">
            {description}
          </p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Main form
   ───────────────────────────────────────────────── */
export function StoreProfileForm() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("identity");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<StoreProfileSchema>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      shopName:     MOCK_STORE_PROFILE.shopName,
      businessType: MOCK_STORE_PROFILE.businessType,
      description:  MOCK_STORE_PROFILE.description ?? "",
      logo:         MOCK_STORE_PROFILE.logo ?? "",
      phone:        MOCK_STORE_PROFILE.phone,
      email:        MOCK_STORE_PROFILE.email,
      website:      MOCK_STORE_PROFILE.website ?? "",
      address: {
        line1:    MOCK_STORE_PROFILE.address.line1,
        line2:    MOCK_STORE_PROFILE.address.line2 ?? "",
        suburb:   MOCK_STORE_PROFILE.address.suburb,
        state:    MOCK_STORE_PROFILE.address.state,
        postcode: MOCK_STORE_PROFILE.address.postcode,
        country:  MOCK_STORE_PROFILE.address.country,
      },
      instagram: MOCK_STORE_PROFILE.instagram ?? "",
      facebook:  MOCK_STORE_PROFILE.facebook ?? "",
      tiktok:    MOCK_STORE_PROFILE.tiktok ?? "",
    },
  });

  const addressValues = watch("address");
  const charCount = (watch("description") ?? "").length;
  const shopName = watch("shopName");
  const businessType = watch("businessType");
  const logoUrl = watch("logo");

  /* ── Profile completeness ─── */
  const completeness = Math.min(
    100,
    (shopName ? 25 : 0) +
      (watch("phone") ? 25 : 0) +
      (watch("address.line1") ? 25 : 0) +
      (watch("email") ? 25 : 0),
  );

  async function onSubmit(data: StoreProfileSchema) {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log("Store profile saved:", data);
    setIsSaving(false);
    toast.success({
      title: "Profile saved",
      message: "Your store profile has been updated successfully.",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-24">

      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER — clean, on-brand
          ═══════════════════════════════════════════════════════════ */}
      <header className="flex items-start justify-between gap-4 flex-wrap pt-1">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "#F5EFE3",
              border: "1px solid rgba(196,168,130,0.4)",
            }}
          >
            <Store size={20} className="text-[#8A6D2F]" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A882] mb-0.5">
              Public profile
            </p>
            <h1 className="text-[22px] md:text-[26px] font-extrabold font-sans text-[#0B1220] leading-tight tracking-tight">
              Store Profile
            </h1>
            <p className="text-sm text-[#4B5563] font-medium mt-1">
              How your shop shows up to clients — identity, contact &amp; location.
            </p>
          </div>
        </div>

        {/* Profile completeness (desktop) */}
        <div className="hidden md:flex flex-col items-end gap-1.5 pt-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#4B5563] font-semibold">
            <span>Profile completeness</span>
            <span className="text-[#0B1220] font-extrabold tabular-nums">{completeness}%</span>
          </div>
          <div className="w-40 h-1.5 rounded-full bg-[#E8E4DA] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C4A882] to-[#D5B584] transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          IDENTITY STRIP — logo + name + business type
          (warm ivory card, not the rainbow hero)
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, #FAF8F3 0%, #F5EFE3 100%)",
          border: "1px solid #E8E4DA",
        }}
      >
        {/* Subtle warm texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(196,168,130,0.8) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative px-5 sm:px-7 py-5 sm:py-6 flex flex-col sm:flex-row items-center sm:items-center gap-5">
          {/* Logo / avatar */}
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white flex items-center justify-center"
              style={{
                border: "1px solid #E8E4DA",
                boxShadow: "0 4px 14px rgba(11,18,32,0.06)",
              }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Shop logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-9 h-9 text-[#C4A882]" strokeWidth={1.5} />
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("identity")}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#0B1220] text-white flex items-center justify-center shadow-lg hover:bg-[#1B3163] transition-colors"
              title="Change logo"
              aria-label="Change logo"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* Name + meta */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0B1220] tracking-tight truncate">
              {shopName || "Your Shop Name"}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-[#4B5563] border border-[#E8E4DA]">
                <Store size={11} />
                {BUSINESS_TYPE_LABELS[businessType as keyof typeof BUSINESS_TYPE_LABELS] || "Business"}
              </span>
              {watch("address.suburb") && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-[#4B5563] border border-[#E8E4DA]">
                  <MapPin size={11} />
                  {watch("address.suburb")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB NAVIGATION — clean underline style
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="sticky top-16 z-[5] bg-[#F5F3EE]/85 backdrop-blur-md -mx-4 px-4 lg:-mx-8 lg:px-8 border-b border-[#E8E4DA]"
      >
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
                  isActive
                    ? "text-[#0B1220]"
                    : "text-[#6B7280] hover:text-[#0B1220]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <TabIcon
                  size={15}
                  className={isActive ? "text-[#C4A882]" : "text-[#9CA3AF]"}
                  strokeWidth={2.25}
                />
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #C4A882, #D5B584)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-5">

        {/* ── IDENTITY TAB ── */}
        {activeTab === "identity" && (
          <div className="space-y-5">
            <SectionCard
              icon={Camera}
              title="Shop logo"
              description="Appears on your booking page and receipts."
              accent="#C4A882"
            >
              <ImageUpload
                value={watch("logo") ?? ""}
                onChange={(val) => setValue("logo", val ?? undefined, { shouldDirty: true })}
                aspect="square"
                maxSizeMB={5}
              />
            </SectionCard>

            <SectionCard
              icon={Store}
              title="Business details"
              description="Your shop's public-facing identity."
              accent="#1B3163"
            >
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Shop name" required error={errors.shopName?.message}>
                    <input
                      {...register("shopName")}
                      placeholder="e.g. The Kempt Studio"
                      className={inputClass(!!errors.shopName)}
                    />
                  </Field>

                  <Field label="Business type" required error={errors.businessType?.message}>
                    <select
                      {...register("businessType")}
                      className={inputClass(!!errors.businessType)}
                    >
                      {(Object.entries(BUSINESS_TYPE_LABELS) as [string, string][]).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field
                  label="Description"
                  hint={`${charCount}/500 — shown to clients on your booking page`}
                  error={errors.description?.message}
                >
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Tell clients what makes your shop unique…"
                    className={cn(inputClass(!!errors.description), "resize-none")}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── CONTACT TAB ── */}
        {activeTab === "contact" && (
          <SectionCard
            icon={Phone}
            title="Contact details"
            description="How clients and partners can reach you."
            accent="#1B3163"
          >
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone number" required error={errors.phone?.message}>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="+61 3 9012 3456"
                      className={prefixInputClass(!!errors.phone)}
                    />
                  </div>
                </Field>

                <Field label="Email address" required error={errors.email?.message}>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="hello@yourshop.com.au"
                      className={prefixInputClass(!!errors.email)}
                    />
                  </div>
                </Field>
              </div>

              <Field
                label="Website"
                hint="Include https:// — e.g. https://yourshop.com.au"
                error={errors.website?.message}
              >
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  <input
                    {...register("website")}
                    type="url"
                    placeholder="https://yourshop.com.au"
                    className={prefixInputClass(!!errors.website)}
                  />
                </div>
              </Field>
            </div>
          </SectionCard>
        )}

        {/* ── LOCATION TAB ── */}
        {activeTab === "location" && (
          <div className="space-y-5">
            <SectionCard
              icon={MapPin}
              title="Shop location"
              description="Shown on the map and used for GPS directions."
              accent="#86B0A5"
            >
              <div className="space-y-4">
                <Field label="Street address" required error={errors.address?.line1?.message}>
                  <input
                    {...register("address.line1")}
                    placeholder="e.g. 142 Smith Street"
                    className={inputClass(!!errors.address?.line1)}
                  />
                </Field>

                <Field label="Suite / shop / level (optional)">
                  <input
                    {...register("address.line2")}
                    placeholder="e.g. Shop 3, Level 2"
                    className={inputClass()}
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Suburb / city" required error={errors.address?.suburb?.message}>
                    <input
                      {...register("address.suburb")}
                      placeholder="e.g. Collingwood"
                      className={inputClass(!!errors.address?.suburb)}
                    />
                  </Field>

                  <Field label="State / territory" required error={errors.address?.state?.message}>
                    <select
                      {...register("address.state")}
                      className={inputClass(!!errors.address?.state)}
                    >
                      <option value="">Select state…</option>
                      {AUSTRALIAN_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                      <option value="OTHER">Other / international</option>
                    </select>
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Postcode" required error={errors.address?.postcode?.message}>
                    <input
                      {...register("address.postcode")}
                      placeholder="3066"
                      maxLength={10}
                      className={inputClass(!!errors.address?.postcode)}
                    />
                  </Field>

                  <Field label="Country" required error={errors.address?.country?.message}>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                      <input
                        {...register("address.country")}
                        placeholder="Australia"
                        className={prefixInputClass(!!errors.address?.country)}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={MapPin}
              title="Map preview"
              description="Updates automatically as you type."
              accent="#1B3163"
            >
              <MapPreview address={addressValues} />
              <p className="text-[11px] text-[#6B7280] mt-3 font-medium">
                Powered by Google Maps.
                {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                  <span className="ml-1 text-amber-700">
                    Set <code className="bg-amber-50 px-1 rounded text-[10px] border border-amber-200">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for Places autocomplete.
                  </span>
                )}
              </p>
            </SectionCard>
          </div>
        )}

        {/* ── SOCIAL TAB ── */}
        {activeTab === "social" && (
          <SectionCard
            icon={Share2}
            title="Social media"
            description="Link your social profiles — shown on your booking page."
            accent="#C4A882"
          >
            <div className="space-y-4">
              <SocialField
                label="Instagram"
                icon={Instagram}
                prefix="@"
                placeholder="yourshop"
                error={errors.instagram?.message}
                {...register("instagram")}
              />
              <SocialField
                label="Facebook"
                icon={Facebook}
                prefix="fb.com/"
                placeholder="yourshop"
                error={errors.facebook?.message}
                {...register("facebook")}
              />
              <SocialField
                label="TikTok"
                icon={() => (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5 text-[#6B7280]"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z" />
                  </svg>
                )}
                prefix="@"
                placeholder="yourshop"
                error={errors.tiktok?.message}
                {...register("tiktok")}
              />
            </div>
          </SectionCard>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FLOATING SAVE BAR
          ═══════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out",
          isDirty
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="max-w-4xl mx-auto px-4 pb-4 sm:pb-5">
          <div
            className="rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3"
            style={{
              backgroundColor: "#0B1220",
              border: "1px solid rgba(196,168,130,0.15)",
              boxShadow:
                "0 12px 32px rgba(11,18,32,0.28), 0 4px 8px rgba(11,18,32,0.18)",
            }}
          >
            <p className="text-xs sm:text-sm text-white/85 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C4A882] animate-pulse" />
              <span className="hidden sm:inline">You have unsaved changes</span>
              <span className="sm:hidden">Unsaved changes</span>
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                "bg-gradient-to-r from-[#C4A882] to-[#D5B584] text-[#0B1220]",
                "hover:shadow-lg hover:shadow-[#C4A882]/30 hover:brightness-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#0B1220]",
                isSaving && "opacity-60 cursor-not-allowed",
              )}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0B1220]/30 border-t-[#0B1220] rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} strokeWidth={2.5} />
                  Save profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
