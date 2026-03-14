import { AvailabilityPageClient } from "@/components/dashboard/availability/availability-page-client";

export const metadata = {
  title: "Availability | GetKempt",
  description: "Manage staff weekly schedules and date-specific availability overrides",
};

export default function AvailabilityPage() {
  return <AvailabilityPageClient />;
}
