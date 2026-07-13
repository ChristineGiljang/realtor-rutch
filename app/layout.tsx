import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-black text-white antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
