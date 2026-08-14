"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock,
  ShieldCheck,
  Layers,
  MessageCircle,
  HandCoins,
  Users,
} from "lucide-react";

const REASONS = [
  {
    icon: Clock,
    title: "Fast, Transparent Approvals",
    desc: "Apply online in minutes and get a decision quickly, no confusing terms, no runaround, no waiting weeks to hear back.",
    from: "left" as const,
  },
  {
    icon: ShieldCheck,
    title: "Your Data, Protected",
    desc: "Your personal and financial details are handled securely at every step, from application through to disbursement.",
    from: "right" as const,
  },
  {
    icon: Layers,
    title: "Flexible Loan Products",
    desc: "Salary-based, business, collateral-secured or group loans, we structure the product around your circumstances, not the other way round.",
    from: "left" as const,
  },
  {
    icon: MessageCircle,
    title: "Local, Reachable Support",
    desc: "Real people on the phone or WhatsApp throughout your journey with us, based right here in Harare, not a call centre script.",
    from: "right" as const,
  },
  {
    icon: HandCoins,
    title: "Fair, Honest Terms",
    desc: "Clear rates and repayment schedules explained upfront, so you always know exactly what you're signing up for.",
    from: "left" as const,
  },
  {
    icon: Users,
    title: "Community-First Approach",
    desc: "From individuals to savings groups and cooperatives, we build lending relationships that grow with the communities we serve.",
    from: "right" as const,
  },
];

const STATS = [
  { value: "2+", label: "Years Delivering" },
  { value: "500+", label: "Customers Served" },
];

function getHiddenTransform(from: "left" | "right") {
  return from === "left" ? "translateX(-48px)" : "translateX(48px)";
}

export function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [visible, setVisible] = useState<Record<number, boolean>>({});
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // MOBILE — each card observed individually, one at a time as you
      // scroll. Cards re-hide when they leave view so they replay on the
      // way back up too.
      const observers = itemRefs.current.map((ref, i) => {
        if (!ref) return null;
        const obs = new IntersectionObserver(
          ([entry]) => {
            setVisible((v) => ({ ...v, [i]: entry.isIntersecting }));
          },
          { threshold: 0.18 }
        );
        obs.observe(ref);
        return obs;
      });
      return () => observers.forEach((o) => o?.disconnect());
    }

    // DESKTOP — whole section observed, cards fire together with a
    // staggered delay. Resets when the section fully leaves so it
    // replays on scroll-back.
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          REASONS.forEach((_, i) => {
            setTimeout(() => {
              setVisible((v) => ({ ...v, [i]: true }));
            }, i * 100);
          });
        } else {
          setVisible({});
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-primary/90 py-14 backdrop-blur-sm sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
            Why Omama Finance
          </p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Why Choose Omama Finance?
          </h2>
          <p className="mt-4 text-white/70">
            Not just a lender, a long-term partner committed to your
            financial goals, from your first application to your last
            repayment.
          </p>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-10 flex max-w-md items-stretch justify-center gap-4 sm:gap-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-2xl border border-gold/20 bg-white/5 px-4 py-5 text-center"
            >
              <div className="font-heading text-3xl font-extrabold text-gold-light sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-white/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REASONS.map((r, i) => {
            const Icon = r.icon;
            const isVisible = visible[i];
            return (
              <div
                key={r.title}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="flex items-start gap-4 rounded-xl border border-gold/10 bg-white/3 p-5 transition-colors duration-300 hover:border-gold/35 hover:bg-gold/5"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? "translateX(0)"
                    : getHiddenTransform(r.from),
                  transition:
                    "opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, background-color 0.3s ease",
                }}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-gold/25 bg-gold/10">
                  <Icon className="h-5 w-5 text-gold-light" strokeWidth={1.75} />
                </div>

                <div>
                  <h3 className="font-heading text-base font-bold text-white sm:text-lg">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65 sm:text-[15px]">
                    {r.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}