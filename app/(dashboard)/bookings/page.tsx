import { BookingsPageClient } from "@/components/dashboard/bookings/bookings-page-client";

export const metadata = {
  title: "Bookings | GetKempt",
  description: "View, manage and create all appointments",
};

export default function BookingsPage() {
  return <BookingsPageClient />;
}
