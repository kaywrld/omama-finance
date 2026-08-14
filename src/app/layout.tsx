import type { Metadata } from "next";

// Self-hosted fonts (via @fontsource) instead of next/font/google.
// This avoids any runtime dependency on fonts.gstatic.com — the font files
// ship inside node_modules, so builds/dev work identically regardless of
// network/firewall conditions. Font-family names are wired to the
// --font-heading / --font-body / --font-mono variables in globals.css.
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_ZW",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      {/*
        bg.png/bg.webp is used as a raw CSS background-image (not
        next/image) across every page — Home, About, Loans, Apply,
        Contact — because it sits behind other layered elements as a
        fixed, viewport-pinned decoration. CSS background-images are
        normally discovered late (only once the browser has parsed the
        stylesheet), so this preload hint tells the browser to start
        fetching it immediately, at the same priority as the page's own
        HTML. Once cached (see public/.htaccess), this only matters on
        the very first page a visitor lands on each session — every
        page after that reuses the cached file for free.
      */}
      <link rel="preload" as="image" href="/bg.webp" fetchPriority="high" />
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/*
          Fixed site-wide background image.
          - `fixed inset-0` pins it to the viewport (not the document), so it
            never scrolls with the page content, on every route.
          - `-z-10` keeps it behind Header/main/Footer, all of which are
            either transparent or semi-transparent so the image shows through.
          - Implemented as its own layer (rather than `background-attachment:
            fixed` on <body>) because that CSS property is unreliable on
            mobile Safari; a fixed, viewport-sized element works everywhere.
        */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg.webp')" }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}