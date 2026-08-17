import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TEAM } from "@/config/team";
import { TeamPhoto } from "@/components/about/OurTeam";

/*
  Deliberately minimal — just a face, name, and title, for scanning at
  a glance on the homepage. Full bios live on /team, this
  section just points there. Pulls from the same TEAM array as the
  About page's full section, so there's one place to update a name,
  title, or photo, not two.
*/
export function Team() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-mono text-xs uppercase tracking-widest text-gold">
              Our Team
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              The People Behind Omama Finance
            </h2>
          </div>
          <Link
            href="/team"
            className="inline-flex shrink-0 items-center gap-2 font-mono text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:text-gold"
          >
            Meet the Full Team
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-8 sm:justify-start">
          {TEAM.map((member) => (
            <Link
              key={member.name}
              href="/team"
              className="group flex flex-col items-center text-center"
            >
              <TeamPhoto name={member.name} image={member.image} size="sm" />
              <h3 className="mt-3 font-heading text-sm font-bold text-ink transition-colors group-hover:text-primary">
                {member.name}
              </h3>
              <p className="mt-0.5 font-mono text-[10px] font-semibold tracking-widest text-gold uppercase">
                {member.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}