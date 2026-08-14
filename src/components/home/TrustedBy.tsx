import Image from "next/image";
import { Apple, PlayCircle } from "lucide-react";

// Light section sitting on the fixed page background — a gap above (mt-*)
// lets that background show through before the white box starts.
// Swap these paths for the real logos once they're in /public
// (e.g. /public/trusted/zimfi.png).
const logos = [
  { src: "/zamfi.png", alt: "ZIMFI" },
  { src: "/rbz.png", alt: "RBZ" },
];

// Store links styled as buttons with lucide icons — swap href for the real
// App Store / Play Store listing links once the app is published.
const storeLinks = [
  { href: "#", icon: Apple, eyebrow: "Download on the", store: "App Store" },
  { href: "#", icon: PlayCircle, eyebrow: "Get it on", store: "Google Play" },
];

export function TrustedBy() {
  return (
    <section className="mt-12 bg-white py-14 sm:mt-20 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        {/* Logos */}
        <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20">
          {logos.map((logo) => (
            <div
              key={logo.src}
              className="relative h-14 w-40 sm:h-20 sm:w-56"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="(min-width: 640px) 224px, 160px"
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Heading + subtext, below the logos */}
        <h2 className="mt-8 font-heading text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
          Trusted By
        </h2>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Verified and certified by all financial bodies.
        </p>

        {/* Get the app */}
        <div className="mt-14 border-t border-border pt-10 sm:mt-16">
          <h3 className="font-heading text-lg font-semibold text-primary sm:text-xl">
            Get the App
          </h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {storeLinks.map(({ href, icon: Icon, eyebrow, store }) => (
              <a
                key={store}
                href={href}
                className="flex items-center gap-3 rounded-lg bg-primary px-5 py-2.5 text-white transition-colors hover:bg-primary-light"
              >
                <Icon className="h-7 w-7 shrink-0" />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] text-white/75">
                    {eyebrow}
                  </span>
                  <span className="block text-sm font-semibold">{store}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}