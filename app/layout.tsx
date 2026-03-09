import type { Metadata } from "next";
import { Rethink_Sans, Hedvig_Letters_Serif } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const hedvigLettersSerif = Hedvig_Letters_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Get Kempt",
    template: "%s | Get Kempt",
  },
  description:
    "Melbourne's booking and management platform for barbers and beauty salons.",
  metadataBase: new URL("https://getkempt.co"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rethinkSans.variable} ${hedvigLettersSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
