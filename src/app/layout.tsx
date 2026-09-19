import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Parallax Carousel — RNDR Realm";
const description =
  "A WebGL exploration by RNDR Realm: an infinite, drag-and-scroll image grid with shader-driven parallax, built with React Three Fiber and GLSL.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — RNDR Realm",
  },
  description,
  applicationName: "Parallax Carousel",
  category: "technology",
  keywords: [
    "RNDR Realm",
    "WebGL",
    "GLSL",
    "shaders",
    "React Three Fiber",
    "three.js",
    "parallax",
    "infinite carousel",
    "creative development",
    "creative studio",
  ],
  authors: [{ name: "RNDR Realm", url: "https://www.rndrealm.com" }],
  creator: "RNDR Realm",
  publisher: "RNDR Realm",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "RNDR Realm",
    title,
    description,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/og3.png",
        width: 1000,
        height: 563,
        alt: "Parallax Carousel — a WebGL exploration by RNDR Realm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: "@rndr_realm",
    creator: "@rndr_realm",
    images: [
      {
        url: "/og3.png",
        alt: "Parallax Carousel — a WebGL exploration by RNDR Realm",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
