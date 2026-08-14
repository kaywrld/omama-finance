"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

// Pure white section — deliberately breaks from the paper/dark-green
// backgrounds used elsewhere on the page so it reads as its own clear
// "how it works" block. Swap the placeholder images below for real photos
// at the same paths whenever they're ready:
//   /public/how-to-apply/step-1.jpg
//   /public/how-to-apply/step-2.jpg
//   /public/how-to-apply/step-3.jpg
//   /public/how-to-apply/step-4.jpg  ← new "check your collateral" step,
//                                       add a real photo here when ready
//                                       (falls back to a shield icon until then)
const steps = [
  {
    number: "01",
    title: "Fill in your application",
    description:
      "Tell us a little about yourself and the loan you need. It only takes a few minutes to complete online.",
    // No dedicated photo for this step yet — falls back to the ShieldCheck
    // icon below (see imgError default state) instead of loading an
    // unrelated image. Add /public/how-to-apply/step-1.jpg and point this
    // at it whenever a real photo is ready.
    image: "",
    alt: "Filling in the loan application form",
  },
  {
    number: "02",
    title: "Submit your documents",
    description:
      "Upload the few supporting documents we ask for so we can verify your details and review your application.",
    image: "/submit.jpg",
    alt: "Submitting supporting documents",
  },
  {
    number: "03",
    title: "Check your collateral",
    description:
      "Applying for a collateral-based loan? List the asset you're offering as security and upload proof of ownership so we can value it. Not applying under that loan type? Skip straight to the next step.",
    image: "/collateral.jpg",
    alt: "Reviewing collateral documents for a secured loan",
  },
  {
    number: "04",
    title: "Get approved & receive funds",
    description:
      "Once approved, we confirm the terms with you and pay your funds out promptly, no hidden waiting around.",
    image: "/approved.jpg",
    alt: "Receiving approved loan funds",
  },
];

// Chevron-style arrow, matching the look used elsewhere on the site —
// a solid gold notched arrow with a dark outline. `direction="down"` is
// used on the mobile stacked layout, `"right"` on the desktop row.
function StepArrow({ direction = "right" }: { direction?: "right" | "down" }) {
  if (direction === "down") {
    return (
      <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <polygon
          points="18,30 6,14 12,14 12,6 24,6 24,14 30,14"
          fill="var(--color-gold)"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <polygon
        points="30,18 14,6 14,12 6,12 6,24 14,24 14,30"
        fill="var(--color-gold)"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HowToApply() {
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [cardState, setCardState] = useState<
    Record<number, { visible: boolean; dir: "down" | "up" }>
  >({});
  // Step 0 has no dedicated photo yet, so it starts in the fallback-icon
  // state; others start false and only fall back if their image 404s.
  const [imgError, setImgError] = useState<Record<number, boolean>>({ 0: true });

  // Track scroll direction in a ref (not state) so the intersection
  // callback below always reads the latest direction without re-binding
  // the observer on every scroll event.
  const scrollDirRef = useRef<"down" | "up">("down");
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollYRef.current) scrollDirRef.current = "down";
      else if (y < lastScrollYRef.current) scrollDirRef.current = "up";
      lastScrollYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Each card animates in from the direction you're scrolling: scrolling
  // down, it rises in from below; scrolling up, it drops in from above.
  // Cards reset when they leave the viewport so the motion replays each
  // time you pass over them, in either direction.
  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          setCardState((prev) => ({
            ...prev,
            [i]: { visible: entry.isIntersecting, dir: scrollDirRef.current },
          }));
        },
        { threshold: 0.2, rootMargin: "-8% 0px -8% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary/70">
          How it works
        </p>
        <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          How to apply for a loan
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary/80">
          Simple steps from application to funds in your account.
        </p>

        <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center md:gap-6">
          {steps.map((step, i) => {
            const state = cardState[i];
            const visible = state?.visible ?? false;
            const dir = state?.dir ?? "down";
            const offset = dir === "down" ? "translateY(32px)" : "translateY(-32px)";

            return (
              <div key={step.number} className="contents">
                <div
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="flex w-full max-w-xs flex-col items-center text-center md:w-64"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : offset,
                    transition: "opacity 0.6s ease, transform 0.6s ease",
                  }}
                >
                  {/* Step number lives on the image; heading + copy stay outside it */}
                  <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-border shadow-md sm:h-56">
                    {imgError[i] ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-primary/10 text-primary/50">
                        <ShieldCheck className="h-8 w-8" />
                      </div>
                    ) : (
                      <Image
                        src={step.image}
                        alt={step.alt}
                        fill
                        sizes="(min-width: 768px) 256px, 320px"
                        className="object-cover"
                        onError={() =>
                          setImgError((prev) => ({ ...prev, [i]: true }))
                        }
                      />
                    )}
                    <div className="absolute left-3 top-3 rounded-full border border-gold/50 bg-primary/80 px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-gold-light backdrop-blur-sm">
                      STEP {step.number}
                    </div>
                  </div>

                  <h3 className="mt-5 font-heading text-lg font-bold text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary/80 sm:text-base">
                    {step.description}
                  </p>
                </div>

                {i < steps.length - 1 && (
                  <div
                    className="flex items-center justify-center py-1 md:h-56 md:py-0"
                    aria-hidden="true"
                  >
                    <span className="md:hidden">
                      <StepArrow direction="down" />
                    </span>
                    <span className="hidden md:inline-flex">
                      <StepArrow direction="right" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}