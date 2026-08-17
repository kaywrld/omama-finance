import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/config/site";
import { Carousel, type CarouselSlide } from "./Carousel";

// Swap these src paths for the real photos whenever they're ready — same
// filenames, drop them into /public and the carousel picks them up.
const slides: CarouselSlide[] = [
  { src: "/slide-1.webp", alt: "Omama Finance client success story" },
  { src: "/slide-2.webp", alt: "Omama Finance loan officer assisting a customer" },
  { src: "/slide-3.webp", alt: "Omama Finance small business supported by a loan" },
];

const telHref = `tel:${siteConfig.contact.phone.replace(/[^+\d]/g, "")}`;
const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  "Hi Omama Finance, I'd like to find out more about your loans.",
)}`;

export function Hero() {
  return (
    // Full-bleed: no max-width/padding here, so the carousel spans the
    // entire viewport width, flush against the bottom of the header above.
    <section className="relative h-140 w-full overflow-hidden sm:h-155 lg:h-170">
      <Carousel slides={slides} />

      {/* Darkening gradient so white text stays readable over any photo. */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/50 via-black/50 to-black/50" />

      {/* Text + CTAs, overlaid on top of the images. */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
              YOUR KEY TO FINANCIAL FREEDOM
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
              {siteConfig.description}
            </h1>

            <p className="mt-5 text-sm font-medium uppercase tracking-wide text-white/80">
              Loan types we offer
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siteConfig.services.map((service) => (
                <li key={service.label}>
                  <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
                    {service.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Call / WhatsApp CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
            <a href={telHref} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white">
              <Phone className="h-4 w-4" />
            </a>
            <a href={whatsappHref} className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-medium text-white">
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}