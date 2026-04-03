"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Store, Phone, Mail, Globe, MapPin,
  Instagram, Facebook, Save, AlertCircle,
  Building2, Sparkles, Camera, Heart,
} from "lucide-react";
import { storeProfileSchema, type StoreProfileSchema } from "@/lib/validations/store-profile";
import { MOCK_STORE_PROFILE } from "@/lib/mock/store-profile";
import { BUSINESS_TYPE_LABELS, AUSTRALIAN_STATES } from "@/types/store-profile";
import { MapPreview } from "./map-preview";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

/* ── Tab definitions ─────────────────────────────────────────── */
const TABS = [
  { id: "identity",  label: "Identity",  icon: Store,     emoji: "✨" },
  { id: "contact",   label: "Contact",   icon: Phone,     emoji: "📞" },
  { id: "location",  label: "Location",  icon: MapPin,    emoji: "📍" },
  { id: "social",    label: "Social",    icon: Instagram,  emoji: "🔗" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ── Field wrapper ─────────────────────────────────────────── */
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
      <label className="text-xs font-semibold text-[#0D1B2A] tracking-wide">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[#8E95A5] leading-relaxed">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Input styling ─────────────────────────────────────────── */
const inputClass = (hasError?: boolean) =>
  cn(
    "w-full text-sm text-[#0D1B2A] border rounded-2xl px-4 py-3 bg-white/80 backdrop-blur-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[#C4A882]/50 focus:border-[#C4A882] focus:bg-white focus:shadow-sm",
    "placeholder:text-[#C4C9D4]",
    hasError
      ? "border-rose-300 bg-rose-50/30"
      : "border-[#E8ECF4] hover:border-[#C4A882]/40 hover:shadow-sm"
  );

const prefixInputClass = (hasError?: boolean) =>
  cn(inputClass(hasError), "pl-10");

/* ── Social handle prefix ─────────────────────────────────── */
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
      <div className="flex items-center gap-0 border border-[#E8ECF4] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#C4A882]/50 focus-within:border-[#C4A882] hover:border-[#C4A882]/40 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:shadow-sm">
        <div className="flex items-center gap-1.5 px-3.5 py-3 bg-gradient-to-b from-[#F8F6F2] to-[#F0EDE7] border-r border-[#E8ECF4] shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#8E95A5]" />
          <span className="text-xs text-[#6B7A99] font-medium">{prefix}</span>
        </div>
        <input
          {...inputProps}
          placeholder={placeholder}
          className="flex-1 text-sm px-3.5 py-3 bg-transparent focus:outline-none placeholder:text-[#C4C9D4] text-[#0D1B2A]"
        />
      </div>
    </Field>
  );
}

/* ── Main form ────────────────────────────────────────────── */
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

      {/* ═══════════════════════════════════════════════════════════
          HERO PROFILE CARD
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-none sm:rounded-2xl">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#1B3163] to-[#2A4A7F]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative px-4 sm:px-8 pt-8 pb-6 sm:pt-10 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar / Logo */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                {logoUrl ? (
                  <img src={logoUrl} alt="Shop logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-10 h-10 text-white/40" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  // Scroll to identity tab and focus on logo upload
                  setActiveTab("identity");
                }}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#C4A882] text-[#0D1B2A] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Shop info */}
            <div className="flex-1 text-center sm:text-left pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {shopName || "Your Shop Name"}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white/80 border border-white/10">
                  <Sparkles className="w-3 h-3" />
                  {BUSINESS_TYPE_LABELS[businessType as keyof typeof BUSINESS_TYPE_LABELS] || "Business"}
                </span>
              </div>
              <p className="text-sm text-white/50 mt-2 hidden sm:block">
                Manage your shop&apos;s public identity, contact details, and location
              </p>
            </div>

            {/* Quick status */}
            <div className="hidden lg:flex flex-col items-end gap-1.5 pb-1">
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Heart className="w-3 h-3" />
                Profile completeness
              </div>
              <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C4A882] to-[#E8D5B7] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(20, (shopName ? 25 : 0) + (watch("phone") ? 25 : 0) + (watch("address.line1") ? 25 : 0) + (watch("email") ? 25 : 0)))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB NAVIGATION
          ═══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8ECF4] shadow-sm">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide px-1 sm:px-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 sm:px-6 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "hover:text-[#0D1B2A]",
                  isActive
                    ? "text-[#0D1B2A]"
                    : "text-[#8E95A5]"
                )}
              >
                <span className="text-base sm:hidden">{tab.emoji}</span>
                <TabIcon className={cn("w-4 h-4 hidden sm:block transition-colors", isActive ? "text-[#C4A882]" : "")} />
                <span>{tab.label}</span>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-[#C4A882] to-[#E8D5B7]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="px-1 sm:px-0 pt-5 pb-24 space-y-5">

        {/* ── IDENTITY TAB ── */}
        {activeTab === "identity" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Logo upload card */}
            <div className="bg-gradient-to-br from-[#FDFCFA] to-[#F8F6F2] rounded-2xl border border-[#E8ECF4] p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C4A882] to-[#E8D5B7] flex items-center justify-center shadow-sm">
                  <Camera className="w-4 h-4 text-[#0D1B2A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0D1B2A]">Shop Logo</h3>
                  <p className="text-[11px] text-[#8E95A5]">This appears on your booking page and receipts</p>
                </div>
              </div>
              <ImageUpload
                value={watch("logo") ?? ""}
                onChange={(val) => setValue("logo", val ?? undefined, { shouldDirty: true })}
                aspect="square"
                maxSizeMB={5}
              />
            </div>

            {/* Business details */}
            <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-gradient-to-r from-[#FDFCFA] to-white border-b border-[#F0F3FA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0D1B2A] to-[#1B3163] flex items-center justify-center shadow-sm">
                    <Store className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D1B2A]">Business Details</h3>
                    <p className="text-[11px] text-[#8E95A5]">Your shop&apos;s public-facing identity</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Shop Name" required error={errors.shopName?.message}>
                    <input
                      {...register("shopName")}
                      placeholder="e.g. The Kempt Studio"
                      className={inputClass(!!errors.shopName)}
                    />
                  </Field>

                  <Field label="Business Type" required error={errors.businessType?.message}>
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
                  hint={`${charCount}/500 — Shown to clients on your booking page`}
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
            </div>
          </div>
        )}

        {/* ── CONTACT TAB ── */}
        {activeTab === "contact" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-gradient-to-r from-[#FDFCFA] to-white border-b border-[#F0F3FA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D1B2A]">Contact Details</h3>
                    <p className="text-[11px] text-[#8E95A5]">How clients and partners can reach you</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone Number" required error={errors.phone?.message}>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A5] pointer-events-none" />
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="+61 3 9012 3456"
                        className={prefixInputClass(!!errors.phone)}
                      />
                    </div>
                  </Field>

                  <Field label="Email Address" required error={errors.email?.message}>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A5] pointer-events-none" />
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
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A5] pointer-events-none" />
                    <input
                      {...register("website")}
                      type="url"
                      placeholder="https://yourshop.com.au"
                      className={prefixInputClass(!!errors.website)}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Quick tip card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100/60 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-base">💡</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-900">Pro tip</p>
                <p className="text-[11px] text-blue-700/80 mt-0.5 leading-relaxed">
                  Adding a phone number and email helps clients reach you directly. These details appear on your booking confirmation emails.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── LOCATION TAB ── */}
        {activeTab === "location" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-gradient-to-r from-[#FDFCFA] to-white border-b border-[#F0F3FA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-sm">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D1B2A]">Shop Location</h3>
                    <p className="text-[11px] text-[#8E95A5]">Your physical address — shown on the map and used for GPS directions</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <Field label="Street Address" required error={errors.address?.line1?.message}>
                  <input
                    {...register("address.line1")}
                    placeholder="e.g. 142 Smith Street"
                    className={inputClass(!!errors.address?.line1)}
                  />
                </Field>

                <Field label="Suite / Shop / Level (optional)">
                  <input
                    {...register("address.line2")}
                    placeholder="e.g. Shop 3, Level 2"
                    className={inputClass()}
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Suburb / City" required error={errors.address?.suburb?.message}>
                    <input
                      {...register("address.suburb")}
                      placeholder="e.g. Collingwood"
                      className={inputClass(!!errors.address?.suburb)}
                    />
                  </Field>

                  <Field label="State / Territory" required error={errors.address?.state?.message}>
                    <select
                      {...register("address.state")}
                      className={inputClass(!!errors.address?.state)}
                    >
                      <option value="">Select state…</option>
                      {AUSTRALIAN_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                      <option value="OTHER">Other / International</option>
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
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A5] pointer-events-none" />
                      <input
                        {...register("address.country")}
                        placeholder="Australia"
                        className={prefixInputClass(!!errors.address?.country)}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* Map preview card */}
            <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-gradient-to-r from-[#FDFCFA] to-white border-b border-[#F0F3FA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F4F2EE] to-[#E8E2D8] flex items-center justify-center">
                    <span className="text-base">🗺️</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D1B2A]">Map Preview</h3>
                    <p className="text-[11px] text-[#8E95A5]">Updates automatically as you type</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <MapPreview address={addressValues} />
                <p className="text-[11px] text-[#8E95A5] mt-3">
                  Powered by Google Maps.
                  {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                    <span className="ml-1 text-amber-600">
                      Set <code className="bg-amber-50 px-1 rounded text-[10px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for full Places Autocomplete.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SOCIAL TAB ── */}
        {activeTab === "social" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-gradient-to-r from-[#FDFCFA] to-white border-b border-[#F0F3FA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center shadow-sm">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D1B2A]">Social Media</h3>
                    <p className="text-[11px] text-[#8E95A5]">Link your social profiles for clients to find you</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
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
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#8E95A5]">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/>
                    </svg>
                  )}
                  prefix="@"
                  placeholder="yourshop"
                  error={errors.tiktok?.message}
                  {...register("tiktok")}
                />
              </div>
            </div>

            {/* Social tip */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-2xl border border-purple-100/60 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <span className="text-base">🎯</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-900">Boost your visibility</p>
                <p className="text-[11px] text-purple-700/80 mt-0.5 leading-relaxed">
                  Shops with linked social profiles get 40% more bookings on average. Your social links appear on your public booking page.
                </p>
              </div>
            </div>
          </div>
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
            : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="max-w-4xl mx-auto px-4 pb-4 sm:pb-5">
          <div className="bg-[#0D1B2A] rounded-2xl shadow-2xl shadow-[#0D1B2A]/20 border border-white/5 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="hidden sm:inline">You have unsaved changes</span>
              <span className="sm:hidden">Unsaved changes</span>
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                "bg-gradient-to-r from-[#C4A882] to-[#E8D5B7] text-[#0D1B2A]",
                "hover:shadow-lg hover:shadow-[#C4A882]/30 hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#0D1B2A]",
                "active:scale-[0.98]",
                isSaving && "opacity-60 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
