import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "./components/SmoothScroll";
import { GradientBackground } from "./components/GradientBackground";
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: '../public/fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi', // This is what Tailwind will read
});

const siteUrl = "https://holo.example";
const description =
  "Holo translates sign language in real time. Sign into your camera, and a lifelike 3D avatar signs right back — a natural, two-way conversation in your own language.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Holo — Conversations without barriers",
    template: "%s — Holo",
  },
  description,
  applicationName: "Holo",
  keywords: [
    "sign language",
    "real-time translation",
    "Deaf community",
    "ASL",
    "BSL",
    "3D avatar",
    "accessibility",
  ],
  authors: [{ name: "Holo" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Holo",
    title: "Holo — Conversations without barriers",
    description,
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Holo — conversations without barriers.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Holo — Conversations without barriers",
    description,
    images: ["/og.svg"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f5ef",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${satoshi.variable}`}>
      <body>
        <a
          href="#waitlist"
          className="sr-only rounded-glass bg-base-700 px-4 py-2 text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to waitlist
        </a>
        <GradientBackground />
        <div className="grain-overlay" aria-hidden="true" />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
