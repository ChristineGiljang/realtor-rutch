import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://realtor-rutch.com"),
  title: {
    default: "Realtor Rutch | Cebu City Real Estate",
    template: "%s | Realtor Rutch",
  },
  description:
    "Realtor Rutch — real estate specialist serving Cebu City and surrounding areas. Browse houses, lots, and luxury properties for sale or rent.",
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/images/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/images/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/images/favicon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="nIdREsSgZJJsPQ7AmdquzA"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geist.className} bg-[#F5F0E8] text-[#1A1A1A] antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
