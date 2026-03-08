import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zelteb – Best Platform to Sell Digital Products & Video Courses Online in India",
    template: "%s | Zelteb",
  },
  description:
    "Zelteb is the best platform to sell digital products, video courses, and digital downloads online. The #1 creator marketplace for Indian creators to monetize digital content — free to start, no coding needed.",
  keywords: [
    // Core keywords
    "sell digital products online",
    "sell video courses online",
    "digital product marketplace",
    "platform to sell digital assets",
    "creator marketplace platform",
    "sell downloadable products",
    "video selling platform",
    "online platform for creators",
    "marketplace for video creators",
    "monetize digital content",
    // Long-tail keywords
    "best platform to sell digital products in India",
    "how to sell video courses online",
    "where to sell digital downloads",
    "website to sell digital files",
    "sell digital products without coding",
    "earn money selling video courses",
    "marketplace for creators in India",
    "upload and sell videos online",
    "sell online courses independently",
    "platform to sell digital goods globally",
    // India-specific brand keywords
    "Zelteb",
    "sell digital products India",
    "Indian creator marketplace",
    "earn money online India creator",
    "sell PDF online India",
    "sell videos online India",
    "digital product store India",
    "online income for creators India",
  ],
  authors: [{ name: "Zelteb", url: "https://zelteb.com" }],
  creator: "Zelteb",
  publisher: "Zelteb",
  metadataBase: new URL("https://zelteb.com"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "8RuTExUv0kI2ShmEt6mvO-TxTlpWQfF5buxCWcbgWzs",
  },
  openGraph: {
    title: "Zelteb – Sell Digital Products & Video Courses Online in India",
    description:
      "The best platform for Indian creators to sell video courses, digital downloads, and digital files online. Free to start. No coding needed.",
    type: "website",
    url: "https://zelteb.com",
    siteName: "Zelteb",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zelteb – Sell Digital Products & Video Courses Online in India",
    description:
      "Upload, sell, and get paid. Zelteb is the creator marketplace platform for Indian creators to monetize digital content — free to start.",
    site: "@zelteb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}