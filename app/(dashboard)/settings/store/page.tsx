import { StoreSettingsClient } from "@/components/dashboard/settings/store-settings-client";

export const metadata = {
  title: "Store Settings | GetSquire",
  description: "Manage scheduling limits, holidays, surcharges, and policies",
};

export default function StoreSettingsPage() {
  return (
    <div className="max-w-3xl space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage booking windows, slot intervals, holidays, surcharges, and client policies
        </p>
      </div>
      <StoreSettingsClient />
    </div>
  );
}
