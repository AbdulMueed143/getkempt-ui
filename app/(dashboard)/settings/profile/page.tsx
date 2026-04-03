import { StoreProfileForm } from "@/components/dashboard/settings/store-profile-form";

export const metadata = {
  title: "Store Profile | GetKempt",
  description: "Manage your shop's public profile, location and contact details",
};

export default function StoreProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-0">
      <StoreProfileForm />
    </div>
  );
}
