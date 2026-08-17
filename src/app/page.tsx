import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { HowToApply } from "@/components/home/HowToApply";
import { Services } from "@/components/home/Services";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Team } from "@/components/home/Team";
import { TrustedBy } from "@/components/home/TrustedBy";

// This page has no per-request data yet, so Next.js serves it as a static,
// pre-rendered page automatically — instant loads, no server work per visit.
// Once real content (rates, testimonials, etc.) comes from the DB, add:
//   export const revalidate = 3600; // ISR: rebuild at most once an hour
//
// Built part by part — Hero is part 1 (carousel + motto + loan types +
// call/WhatsApp CTAs). Further sections get added below as their own
// components in src/components/home/.

export default function HomePage() {
  return (
    <div className="pb-24">
      <Hero />
      <Intro />
      <Services />
      <HowToApply />
      <WhyChooseUs />
      <Team />
      <TrustedBy />
    </div>
  );
}