"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Store, Phone, Mail, Globe, MapPin,
  Instagram, Facebook, Save, AlertCircle,
  Building2,
} from "lucide-react";
import { storeProfileSchema, type StoreProfileSchema } from "@/lib/validations/store-profile";
import { MOCK_STORE_PROFILE } from "@/lib/mock/store-profile";
import { BUSINESS_TYPE_LABELS, AUSTRALIAN_STATES } from "@/types/store-profile";
import { MapPreview } from "./map-preview";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

/* ── Small section wrapper ───────────────────────────────────── */
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEF1F8] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#1B3163]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

/* ── Shared field wrapper ─────────────────────────────────────── */
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
      <label className="text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Input styling helper ─────────────────────────────────────── */
const inputClass = (hasError?: boolean) =>
  cn(
    "w-full text-sm border rounded-xl px-3 py-2.5 bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent",
    "placeholder:text-gray-400",
    hasError
      ? "border-rose-300 bg-rose-50/30"
      : "border-gray-200 hover:border-gray-300"
  );

const prefixInputClass = (hasError?: boolean) =>
  cn(inputClass(hasError), "pl-9");

/* ── Social handle prefix ─────────────────────────────────────── */
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
      <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1B3163] focus-within:border-transparent hover:border-gray-300 transition-colors bg-white">
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-gray-200 shrink-0">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">{prefix}</span>
        </div>
        <input
          {...inputProps}
          placeholder={placeholder}
          className="flex-1 text-sm px-3 py-2.5 bg-transparent focus:outline-none placeholder:text-gray-400"
        />
      </div>
    </Field>
  );
}

/* ── Main form ────────────────────────────────────────────────── */
export function StoreProfileForm() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

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

  // Live-watch address fields so the map updates in real time
  const addressValues = watch("address");
  const charCount = (watch("description") ?? "").length;

  async function onSubmit(data: StoreProfileSchema) {
    setIsSaving(true);
    // TODO: replace with actual API call
    await new Promise((r) => setTimeout(r, 800));
    console.log("Store profile saved:", data);
    setIsSaving(false);
    toast.success({
      title: "Profile saved",
      message: "Your store profile has been updated successfully.",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Business info ── */}
      <Section icon={Store} title="Business Info" description="Your shop's public-facing identity">
        {/* Logo upload */}
        <Field label="Shop Logo / Profile Photo">
          <ImageUpload
            value={watch("logo") ?? ""}
            onChange={(val) => setValue("logo", val ?? undefined, { shouldDirty: true })}
            aspect="square"
            maxSizeMB={5}
          />
        </Field>

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
      </Section>

      {/* ── Contact details ── */}
      <Section icon={Phone} title="Contact Details" description="How clients and partners can reach you">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone Number" required error={errors.phone?.message}>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              {...register("website")}
              type="url"
              placeholder="https://yourshop.com.au"
              className={prefixInputClass(!!errors.website)}
            />
          </div>
        </Field>
      </Section>

      {/* ── Location ── */}
      <Section
        icon={MapPin}
        title="Shop Location"
        description="Your physical address — shown on the map and used for GPS directions"
      >
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
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                {...register("address.country")}
                placeholder="Australia"
                className={prefixInputClass(!!errors.address?.country)}
              />
            </div>
          </Field>
        </div>

        {/* Live map preview */}
        <div className="pt-1">
          <p className="text-xs font-semibold text-gray-700 mb-2">Map Preview</p>
          <MapPreview address={addressValues} />
          <p className="text-xs text-gray-400 mt-2">
            Map updates automatically as you type. Powered by Google Maps.
            {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <span className="ml-1 text-amber-600">
                Set <code className="bg-amber-50 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for full Places Autocomplete.
              </span>
            )}
          </p>
        </div>
      </Section>

      {/* ── Social media ── */}
      <Section
        icon={Instagram}
        title="Social Media"
        description="Optional — link your social profiles for clients to find you"
      >
        <div className="grid sm:grid-cols-3 gap-4">
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
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gray-400">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/>
              </svg>
            )}
            prefix="@"
            placeholder="yourshop"
            error={errors.tiktok?.message}
            {...register("tiktok")}
          />
        </div>
      </Section>

      {/* ── Save bar ── */}
      <div
        className={cn(
          "sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100",
          "flex items-center justify-between gap-4 px-5 py-4 rounded-b-xl -mx-1 shadow-lg shadow-gray-100/60",
          "transition-all",
          isDirty ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <p className="text-sm text-amber-700 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You have unsaved changes
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            "bg-[#1B3163] text-white hover:bg-[#152748] focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:ring-offset-2",
            isSaving && "opacity-60 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
    </form>
  );
}
