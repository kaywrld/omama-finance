"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";

// Duplicate the list once so the track can loop seamlessly: when the first
// copy has scrolled fully past, we snap the offset back to 0 unnoticed.
const items = [...siteConfig.services, ...siteConfig.services];

const SPEED_PX_PER_FRAME = 0.5;

export function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    function animate() {
      if (!isPaused && track) {
        posRef.current += SPEED_PX_PER_FRAME;
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused]);

  return (
    <section className="overflow-hidden py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-white">
          What we offer
        </p>
        <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm sm:text-4xl">
          Our Services
        </h2>
      </div>

      <div className="relative mt-10">
        <div
          className="cursor-grab overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div ref={trackRef} className="flex w-max gap-5 will-change-transform">
            {items.map((service, i) => (
              <Link
                key={`${service.label}-${i}`}
                href={service.href}
                className="group relative h-90 w-70 shrink-0 overflow-hidden rounded-2xl border border-border shadow-md sm:h-105 sm:w-[320px]"
              >
                <Image
                  src={service.image}
                  alt={service.label}
                  fill
                  draggable={false}
                  sizes="(min-width: 640px) 320px, 280px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Bottom gradient so the label stays readable over any photo */}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="mb-2 h-0.5 w-8 rounded-full bg-gold" />
                  <h3 className="text-2xl font-extrabold text-gold drop-shadow-sm">
                    {service.label}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-white/80">
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* View more — links through to the full services/loans page */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/loans"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light"
        >
          View more
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}