import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Name | Luxury Real Estate",
  description:
    "Luxury real estate specialist serving [Your City] and surrounding areas.",
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
