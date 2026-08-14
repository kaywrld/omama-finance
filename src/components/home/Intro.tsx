import { siteConfig } from "@/config/site";

// Sits flush against the Hero above (no top margin/padding on this section,
// no bottom margin on Hero) so the dark green starts exactly where the
// carousel ends.
export function Intro() {
  return (
    <section className="bg-primary/95 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
          Who we are
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Empowering women, alleviating poverty
        </h2>
        <p className="mt-5 text-white/85 sm:text-lg">
          &ldquo;Omama&rdquo; means &ldquo;mother&rdquo; equipping women
          with the financial tools and resources they need to break the
          cycle of poverty, with an intentional focus on the underserved.
          A loan shouldn&rsquo;t come with confusing terms or long waits,
          so our process is built to be transparent, quick, and treat
          every applicant with respect.
        </p>
        <p className="mt-4 text-white/85 sm:text-lg">
          {siteConfig.description} From individuals to cooperatives, our team
          works with you to find the loan that fits, and stays reachable by
          phone or WhatsApp throughout your journey with us.
        </p>
      </div>
    </section>
  );
}