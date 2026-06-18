import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk,
  Inter,
  Cormorant_Garamond,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { MediaDragGuard } from "@/components/providers/MediaDragGuard";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { getSiteUrl } from "@/lib/utils";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();
const socialImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Chapitre 3",
    "studio créatif",
    "projets numériques",
    "design",
    "produit",
    "Synk",
  ],
  authors: [{ name: SITE_NAME }],
  icons: {
    icon: "/brand/logo.png",
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [socialImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${sans.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="grain-overlay min-h-screen bg-ink-950 text-paper">
        {/* Anti-FOUC : applique le thème (sauvegardé ou système) avant le rendu. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('c3-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <ThemeProvider>
          <SoundProvider>
            <MediaDragGuard />
            <ToastProvider>{children}</ToastProvider>
          </SoundProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
