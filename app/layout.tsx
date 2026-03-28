import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/AppProviders";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteName = "Thalaiva";
const defaultTitle = "Thalaiva — IPL Fantasy League";
const defaultDescription =
  "Multi-user IPL fantasy competitions with tier-based squads and live scoring.";

/** Resolves relative OG / Twitter image URLs. Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yourdomain.com). */
function getMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const u = explicit.endsWith("/") ? explicit.slice(0, -1) : explicit;
    return new URL(u);
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

const metadataBase = getMetadataBase();
const ogImagePath = "/thalaiva-logo.png";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  applicationName: siteName,
  keywords: ["IPL", "fantasy cricket", "fantasy league", "Thalaiva", "cricket", "T20"],
  authors: [{ name: siteName }],
  creator: siteName,
  icons: {
    icon: [{ url: ogImagePath, type: "image/png" }],
    apple: [{ url: ogImagePath, type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: ogImagePath,
        type: "image/png",
        alt: `${siteName} — IPL Fantasy League`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImagePath],
  },
  ...(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    ? { facebook: { appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <SiteHeader />
          <main className="mx-auto max-w-10xl px-4 py-8">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
