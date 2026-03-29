import { StoreProfileForm } from "@/components/dashboard/settings/store-profile-form";

export const metadata = {
  title: "Store Profile | GetKempt",
  description: "Manage your shop's public profile, location and contact details",
};

export default function StoreProfilePage() {
  return (
    <div className="max-w-3xl space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your shop&apos;s public identity, contact details, and location
        </p>
      </div>
      <StoreProfileForm />
    </div>
  );
}
