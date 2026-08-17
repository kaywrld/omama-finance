import type { Metadata } from "next";
import { OurTeam } from "@/components/about/OurTeam";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the people behind Omama Finance — the team personally reviewing every application and keeping Omama accountable to the communities it serves.",
};

export default function TeamPage() {
  return (
    <>
      {/* HERO — same background-image + dark green overlay treatment as
          the About and Loans pages, so this reads as a peer page in the
          nav, not a bolted-on afterthought. */}
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
          <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
            Meet Us
          </p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Our{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-gold-light), var(--color-gold))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Team
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            A small team, personally reviewing every application, so the
            support you get is never a script.
          </p>
        </div>
      </div>

      <OurTeam />
    </>
  );
}