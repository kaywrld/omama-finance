"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TEAM, getInitials } from "@/config/team";

export function TeamPhoto({ name, image, size = "lg" }: { name: string; image: string; size?: "lg" | "sm" }) {
  const [imgError, setImgError] = useState(!image);
  const dims = size === "lg" ? "h-32 w-32 sm:h-36 sm:w-36" : "h-24 w-24 sm:h-28 sm:w-28";
  const textSize = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={`relative shrink-0 ${dims}`}>
      {/* Dual-tone ring — dark green + gold split as two semicircles,
          echoing the circular badge around the woman's portrait in the
          Omama logo. A 135deg split reads as a flame lick rather than
          a flat half/half split. */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 135deg, var(--color-primary) 0deg 180deg, var(--color-gold) 180deg 360deg)",
        }}
      />
      <div className="absolute inset-1 rounded-full bg-white p-0.75">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-primary/6">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className={`font-heading font-bold text-primary ${textSize}`}>
                {getInitials(name)}
              </span>
            </div>
          ) : (
            <Image
              src={image}
              alt={name}
              fill
              sizes="144px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function OurTeam() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          TEAM.forEach((_, i) => {
            setTimeout(() => {
              setVisible((v) => ({ ...v, [i]: true }));
            }, i * 120);
          });
        } else {
          setVisible({});
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="team" ref={sectionRef} className="scroll-mt-24 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-gold">
            Our Team
          </p>
          <div className="mx-auto mt-3 h-0.75 w-11 rounded-full bg-primary" />
          <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            The People Behind Omama Finance
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            A small team, personally reviewing every application, so the
            support you get is never a script.
          </p>
        </div>

        {/* Team list */}
        <div className="mt-14 flex flex-col divide-y divide-border">
          {TEAM.map((member, i) => {
            const isVisible = visible[i];
            return (
              <div
                key={member.name + i}
                className="flex flex-col items-center gap-5 py-8 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left first:pt-0 last:pb-0"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(24px)",
                  transition:
                    "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                {/* Photo + name + title — stays together as one block */}
                <div className="flex shrink-0 flex-col items-center sm:w-44">
                  <TeamPhoto name={member.name} image={member.image} />
                  <h3 className="mt-4 font-heading text-base font-bold text-ink">
                    {member.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] font-semibold tracking-widest text-gold uppercase">
                    {member.title}
                  </p>
                </div>

                {/* Description — beside on desktop, below on mobile
                    (this is just document order + flex-col→flex-row
                    at sm:, no extra work needed) */}
                <div className="max-w-xl space-y-3 text-sm leading-relaxed text-muted sm:text-[15px]">
                  {member.bio.map((para, pi) => (
                    <p key={pi}>{para}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}