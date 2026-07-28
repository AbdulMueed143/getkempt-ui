import type { Metadata } from "next";
import { getAllBusinessSlugs, getBusinessBySlug } from "@/lib/api/public-booking";
import { BookingExperience } from "@/components/booking/booking-experience";

/**
 * Static export needs the set of slugs to prerender at build time.
 * Today that's the mock business(es); once the Java backend is live this
 * should list active businesses (or the route moves to on-demand rendering).
 */
export function generateStaticParams() {
  return getAllBusinessSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: "Book an appointment" };
  return {
    title: `Book with ${business.shopName}`,
    description:
      business.description ??
      `Book your next appointment with ${business.shopName} online.`,
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BookingExperience slug={slug} />;
}
