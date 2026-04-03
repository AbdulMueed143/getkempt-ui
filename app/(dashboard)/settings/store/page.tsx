import { StoreSettingsClient } from "@/components/dashboard/settings/store-settings-client";

export const metadata = {
  title: "Store Settings | GetKempt",
  description: "Manage scheduling limits, holidays, surcharges, and policies",
};

export default function StoreSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-0">
      <StoreSettingsClient />
    </div>
  );
}
