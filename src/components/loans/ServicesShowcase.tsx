"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/config/site";

// ─────────────────────────────────────────────
// Scroll-reveal, matching the pattern used across the rest of the site.
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("ls-visible");
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("ls-visible");
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  dir = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  dir?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useReveal();
  const cls = dir === "left" ? "ls-rl" : dir === "right" ? "ls-rr" : "ls-ru";
  return (
    <div
      ref={ref}
      className={`${cls} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

const ACCENTS = ["gold", "primary-light"] as const;

export function ServicesShowcase() {
  const services = siteConfig.services;
  const [active, setActive] = useState(services[0].label);

  return (
    <>
      <style>{`
        .ls-ru,.ls-rl,.ls-rr{opacity:0;transition:opacity .7s cubic-bezier(.22,.68,0,1.2),transform .7s cubic-bezier(.22,.68,0,1.2);}
        .ls-ru{transform:translateY(28px);}
        .ls-rl{transform:translateX(-32px);}
        .ls-rr{transform:translateX(32px);}
        .ls-ru.ls-visible,.ls-rl.ls-visible,.ls-rr.ls-visible{opacity:1;transform:none;}
        .ls-tabs::-webkit-scrollbar{display:none;}
      `}</style>

      {/* ══════════════════════════════════════════
          HERO — dark green
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-primary-light/30 py-16 sm:py-24">
        {/* Background image */}
        <div
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: "url('/bg.webp')" }}
        />
        {/* Green tint overlay on top of the image */}
        <div className="absolute inset-0 -z-10 bg-primary/94" />
        {/* Faint radial glow, purely a texture cue — no imagery available */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 85% 0%, color-mix(in srgb, var(--color-gold) 18%, transparent), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
              Services that we offer
            </p>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Loans built around{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-gold-light), var(--color-gold))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                how you earn
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Five products, one straightforward process. Pick the one that
              fits your situation below, or apply and we&apos;ll help you
              find the right fit, no obligation, no pressure.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STICKY PRODUCT TABS
      ══════════════════════════════════════════ */}
      <div className="sticky top-20 z-30 border-b border-border bg-white/95 backdrop-blur sm:top-24">
        <nav className="ls-tabs mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6 scrollbar-none">
          {services.map((s, i) => (
            <button
              key={s.label}
              onClick={() => {
                setActive(s.label);
                document
                  .getElementById(`svc-${i}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-4 font-mono text-[11px] font-semibold tracking-widest uppercase transition-colors sm:px-5 ${
                active === s.label
                  ? "border-gold text-primary"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <span className="mr-2 opacity-50">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ══════════════════════════════════════════
          PRODUCT DETAIL SECTIONS — white background
      ══════════════════════════════════════════ */}
      <div className="bg-white">
        {services.map((service, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const accentVar = `var(--color-${accent})`;
          return (
            <div key={service.label} id={`svc-${i}`}>
              <div
                className={`mx-auto flex max-w-6xl scroll-mt-40 flex-col items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:gap-16 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                {/* Image column */}
                <Reveal dir={i % 2 === 0 ? "left" : "right"} className="w-full lg:w-1/2">
                  <div className="relative">
                    <div
                      className="absolute -top-4 -left-4 z-10 flex h-14 w-14 items-center justify-center rounded-full font-heading text-sm font-extrabold text-primary shadow-md"
                      style={{ background: accentVar }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border shadow-md sm:h-80 lg:h-96">
                      <Image
                        src={service.image}
                        alt={service.label}
                        fill
                        sizes="(min-width: 1024px) 560px, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />

                      {/* Stat chip */}
                      <div className="absolute right-4 bottom-4 rounded-lg border border-white/20 bg-primary/90 px-4 py-3 text-center backdrop-blur">
                        <div
                          className="font-heading text-2xl leading-none font-extrabold"
                          style={{ color: accentVar }}
                        >
                          {service.stat.value}
                        </div>
                        <div className="mt-1 font-mono text-[10px] font-semibold tracking-widest text-white/70 uppercase">
                          {service.stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Text column */}
                <Reveal
                  dir={i % 2 === 0 ? "right" : "left"}
                  delay={0.1}
                  className="w-full lg:w-1/2"
                >
                  <div
                    className="mb-3 flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-widest uppercase"
                    style={{ color: accentVar }}
                  >
                    <span
                      className="inline-block h-px w-7"
                      style={{ background: accentVar }}
                    />
                    Product {String(i + 1).padStart(2, "0")}
                  </div>

                  <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
                    {service.label}
                  </h2>

                  <p className="mt-4 leading-relaxed text-muted">
                    {service.detail}
                  </p>

                  <div className="mt-6 rounded-xl border border-border bg-paper/60 px-5">
                    <div className="pt-4 pb-2 font-mono text-[10px] font-semibold tracking-widest text-muted/70 uppercase">
                      What&apos;s included
                    </div>
                    <ul className="space-y-2.5 pb-4">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-ink sm:text-base"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                            strokeWidth={2.5}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={siteConfig.applyHref}
                    className="mt-7 inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[color-mix(in_srgb,var(--color-gold)_85%,black)]"
                  >
                    Apply for {service.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Reveal>
              </div>

              {i < services.length - 1 && (
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                  <div className="h-px bg-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          WHY OMAMA — dark green band
      ══════════════════════════════════════════ */}
      <div className="border-y border-primary-light/30 bg-primary/90 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
              Why Omama Finance
            </p>
            <div className="mt-3 mb-4 h-0.5 w-10 rounded-full bg-gold" />
            <h2 className="font-heading text-2xl font-extrabold text-white sm:text-4xl">
              Lending that treats you fairly
            </h2>
          </Reveal>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 px-4 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: "Fast, transparent decisions",
              body: "Clear eligibility criteria and quick answers — no runaround, no hidden conditions.",
            },
            {
              title: "Rates you can read",
              body: "Every rate and fee is spelled out up front, in plain language, before you sign anything.",
            },
            {
              title: "Built around your income",
              body: "Repayment plans that match how and when you actually get paid, not a generic schedule.",
            },
            {
              title: "Licensed & regulated",
              body: "We operate within Zimbabwe's lending regulations, so your loan is on solid legal footing.",
            },
            {
              title: "Support from real people",
              body: "A real team you can call or WhatsApp — not a ticket queue that goes quiet after approval.",
            },
            {
              title: "Group & community lending",
              body: "Savings and lending products designed for chamas, cooperatives, and salaried groups alike.",
            },
          ].map(({ title, body }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="h-full bg-primary p-7">
                <h3 className="font-heading text-base font-bold text-white">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/65">
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CLOSING CTA — white
      ══════════════════════════════════════════ */}
      <div className="bg-white/80 px-4 py-16 text-center sm:px-6 sm:py-24">
        <Reveal className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
            Not sure which product fits?
          </h2>
          <p className="mt-3 text-muted">
            Reach out and we&apos;ll help you find the right loan for your
            situation, no obligation, no pressure.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={siteConfig.applyHref}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light"
            >
              Apply now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
            >
              Contact us
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}