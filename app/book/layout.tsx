import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Book an appointment",
    template: "%s | Get Kempt",
  },
  robots: { index: true, follow: true },
};

/**
 * Consumer-facing booking surface. Uses the warm light theme (`app-surface`)
 * rather than the dark landing body or the dashboard chrome.
 */
export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="app-surface min-h-screen">{children}</div>;
}
