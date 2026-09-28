
import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Mahakal A To Z | Men's Wear Wholesale",
    template: "%s | Mahakal A To Z",
  },

  description:
    "Mahakal A To Z - Wholesale men's wear collection. Explore shirts, T-shirts, jeans, trousers, ethnic wear and more. Contact us for bulk orders and wholesale enquiries.",

  keywords: [
    "Men's Wear Wholesale",
    "Wholesale Shirts",
    "Wholesale T-Shirts",
    "Wholesale Jeans",
    "Wholesale Garments",
    "Mahakal A To Z",
  ],

  openGraph: {
    title: "Mahakal A To Z | Men's Wear Wholesale",
    description:
      "Explore men's wear wholesale collections and send your bulk order enquiries directly to us.",
    type: "website",
    locale: "en_IN",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
