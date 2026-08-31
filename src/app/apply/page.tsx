import type { Metadata } from "next";
import { LoanApplicationForm } from "@/components/forms/LoanApplicationForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Apply for a loan",
  description: "Submit a loan application online. We'll call you to follow up.",
};

export default function ApplyPage() {
  return (
    <div className="relative overflow-hidden py-14 sm:py-20">
      {/* Fixed background image with a dark green tint, same treatment as
          the contact page form section, so the card reads clearly on top. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/bg.webp')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-primary/90" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-gold-light">
            Get started
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Apply for a loan
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Pick a loan type, fill in your details, and attach any
            supporting documents. {siteConfig.contact.hoursNote}
          </p>
        </div>

        <LoanApplicationForm />
      </div>
    </div>
  );
}