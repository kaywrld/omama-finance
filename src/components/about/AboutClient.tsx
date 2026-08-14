"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lightbulb,
  Users,
  Heart,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/config/site";

// ─────────────────────────────────────────────
// Scroll-reveal — same pattern used on the Loans/Services page.
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("ab-visible");
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("ab-visible");
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
  const cls = dir === "left" ? "ab-rl" : dir === "right" ? "ab-rr" : "ab-ru";
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

// ─────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────
const STATS = [
  { value: "2+", label: "Years Delivering" },
  { value: "500+", label: "Customers Served" },
  { value: "5", label: "Loan Products" },
  { value: "24 hrs", label: "Avg. Approval Time" },
];

const VALUES = [
  {
    icon: Lightbulb,
    title: "Innovation",
    body: "We leverage technology to streamline our processes and make our services more accessible to women in remote and underserved areas.",
  },
  {
    icon: Users,
    title: "Community",
    body: "We believe in the power of community and work to foster strong, supportive networks among our clients.",
  },
  {
    icon: Heart,
    title: "Empowerment",
    body: "We are committed to empowering women by providing them with the financial resources and knowledge they need to succeed.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    body: "We adhere to the highest ethical standards in all our operations, ensuring accountability and transparency. Our key priority is to be a partner you can trust.",
  },
];

const SEGMENTS = [
  "Salaried Employees",
  "Small Businesses",
  "Asset Owners",
  "Savings Groups & Cooperatives",
  "Insured Members",
];

export default function AboutClient() {
  return (
    <>
      <style>{`
        .ab-ru,.ab-rl,.ab-rr{opacity:0;transition:opacity .7s cubic-bezier(.22,.68,0,1.2),transform .7s cubic-bezier(.22,.68,0,1.2);}
        .ab-ru{transform:translateY(28px);}
        .ab-rl{transform:translateX(-32px);}
        .ab-rr{transform:translateX(32px);}
        .ab-ru.ab-visible,.ab-rl.ab-visible,.ab-rr.ab-visible{opacity:1;transform:none;}
      `}</style>

      {/* ══════════════════════════════════════════
          HERO — background image + dark green overlay,
          same treatment as the Loans/Services page.
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-primary-light/90 py-16 sm:py-24">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.webp')" }}
        />
        <div className="absolute inset-0 -z-10 bg-primary/90" />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 85% 0%, color-mix(in srgb, var(--color-gold) 18%, transparent), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
              Our Story
            </p>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              About{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-gold-light), var(--color-gold))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Omama Finance
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/75 sm:text-lg">
              {siteConfig.description} Here&apos;s who we are, what drives
              us, and why thousands of Zimbabweans trust us with their
              financial goals.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS — white background
      ══════════════════════════════════════════ */}
      <div className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <div className="rounded-2xl border border-border bg-paper/60 px-4 py-6 text-center transition-colors hover:border-gold/40">
                  <div className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted sm:text-[11px]">
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHO WE ARE — image + text split
      ══════════════════════════════════════════ */}
      <div className="bg-paper/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal dir="left">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border shadow-md sm:h-80 lg:h-105">
                {/* Swap for a real photo of the Omama team/office once available — same filename in /public. */}
                <Image
                  src="/slide-2.webp"
                  alt="The Omama Finance team at work"
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <Reveal dir="right">
              <p className="font-mono text-xs uppercase tracking-widest text-gold">
                Company Overview
              </p>
              <div className="mt-3 h-0.75 w-11 rounded-full bg-primary/90" />
              <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Who We Are
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                We provide accessible, technology-driven financial services
                targeted at underserved communities. Omama is a vibrant
                Microfinance Institution committed to empowering the
                disadvantaged in community with an intentional focus on
                women, equipping them with the financial tools and
                resources needed to break the cycle of poverty.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                &ldquo;Omama&rdquo; is derived from our native language,
                meaning &ldquo;mother.&rdquo; This name embodies the
                nurturing, supportive, and influential role of a mother in
                society, and Omama Finance is dedicated to fostering
                success stories by providing financial services and
                support to women. We aim to restore dignity to women and
                mothers through financial inclusion, because when women
                are empowered, households are restored and they thrive.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                From our office in Harare, our team reviews every
                application personally and stays reachable by phone or
                WhatsApp throughout the process, no call-centre scripts,
                no disappearing after disbursement.
              </p>
              <Link
                href="/loans"
                className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-primary uppercase hover:text-gold"
              >
                See our loan products
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHAT WE OFFER — quick services grid
      ══════════════════════════════════════════ */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-gold">
              What We Do
            </p>
            <div className="mx-auto mt-3 h-0.75 w-11 rounded-full bg-primary" />
            <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Our Loan Products
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.services.map((service, i) => (
              <Reveal key={service.label} delay={i * 0.07}>
                <Link
                  href={service.href}
                  className="group relative block aspect-4/3 overflow-hidden rounded-2xl border border-border"
                >
                  <Image
                    src={service.image}
                    alt={service.label}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="mb-2 h-0.5 w-6 rounded-full bg-gold-light" />
                    <div className="font-heading text-base font-bold text-white">
                      {service.label}
                    </div>
                    <p className="mt-1 text-xs text-white/70">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MISSION & VISION — text card + image split
      ══════════════════════════════════════════ */}
      <div className="bg-paper/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal dir="left">
              <div className="rounded-2xl border border-border bg-white p-8 shadow-sm sm:p-10">
                <p className="font-mono text-xs uppercase tracking-widest text-gold">
                  Mission
                </p>
                <div className="mt-3 h-0.75 w-11 rounded-full bg-primary" />
                <p className="mt-4 leading-relaxed text-muted">
                  To alleviate poverty through the provision of financial
                  services that empower women to achieve financial
                  independence and improve their standards of living.
                </p>

                <div className="my-6 h-px bg-border" />

                <p className="font-mono text-xs uppercase tracking-widest text-gold">
                  Vision
                </p>
                <div className="mt-3 h-0.75 w-11 rounded-full bg-primary" />
                <p className="mt-4 leading-relaxed text-muted">
                  We envision a world where all women, regardless of their
                  socio-economic background, have access to the financial
                  resources they need to create sustainable livelihoods,
                  contribute to their communities, and lead dignified
                  lives.
                </p>
              </div>
            </Reveal>

            <Reveal dir="right">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border shadow-md sm:h-80 lg:h-105">
                {/* Swap for a real office/branch photo once available. */}
                <Image
                  src="/office.jpg"
                  alt="Omama Finance office in Harare"
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CORE VALUES
      ══════════════════════════════════════════ */}
      <div className="bg-primary/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
              Core Values
            </p>
            <div className="mx-auto mt-3 h-0.75 w-11 rounded-full bg-gold" />
            <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              What Guides Every Loan We Make
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-gold/50">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-primary/15 bg-primary/8">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-bold text-black">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/75">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHO WE SERVE — image + segments
      ══════════════════════════════════════════ */}
      <div className="bg-paper/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal dir="left">
              <p className="font-mono text-xs uppercase tracking-widest text-gold">
                Who We Serve
              </p>
              <div className="mt-3 h-0.75 w-11 rounded-full bg-primary" />
              <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Built for Every Stage of Your Financial Journey
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                Whether you&apos;re borrowing against your salary, growing
                a small business, unlocking value from an asset, or
                lending as part of a savings group, Omama Finance
                structures the loan around you.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {SEGMENTS.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 font-mono text-[11px] font-semibold tracking-widest text-primary uppercase"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <Link
                href={siteConfig.applyHref}
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-light"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal dir="right">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border shadow-md sm:h-80 lg:h-105">
                {/* Swap for a real photo of clients/community once available. */}
                <Image
                  src="/group-loan.jpg"
                  alt="Omama Finance clients and community"
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}