import { VisitsPageClient } from "@/components/dashboard/visits/visits-page-client";

export const metadata = {
  title: "Visits | GetKempt",
  description: "Review past appointments and mark attendance",
};

export default function VisitsPage() {
  return <VisitsPageClient />;
}
