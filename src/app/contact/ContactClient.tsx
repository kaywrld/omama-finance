"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

// ─────────────────────────────────────────────
// Reveal-on-scroll hook
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.08 }
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
  style = {},
}: {
  children: React.ReactNode;
  dir?: "up" | "left" | "right";
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useReveal();
  const cls =
    dir === "left" ? "ct-reveal-left" : dir === "right" ? "ct-reveal-right" : "ct-reveal";
  return (
    <div ref={ref} className={cls} style={{ transitionDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Contact info cards
// ─────────────────────────────────────────────
const contactItems = [
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.contact.phone,
    sub: "Tap to call",
    href: `tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`,
  },
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: siteConfig.contact.phone,
    sub: "Tap to chat",
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.contact.email,
    sub: "Tap to email",
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: siteConfig.contact.address,
    sub: "Our office",
  },
];

const loanTypes = [
  "Select enquiry type",
  "Personal Loan",
  "Business Loan",
  "Salary-Based Loan",
  "Repayment Support",
  "General Enquiry",
];

export default function ContactClient() {
  const [form, setForm] = useState({
    name: "",
    employer: "",
    email: "",
    phone: "",
    enquiry: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire up to your backend / email service here
    setSubmitted(true);
  };

  return (
    <>
      <style>{`
        .ct-reveal       { opacity:0; transform:translateY(36px); transition:opacity .75s cubic-bezier(.22,.68,0,1.2), transform .75s cubic-bezier(.22,.68,0,1.2); }
        .ct-reveal-left  { opacity:0; transform:translateX(-44px); transition:opacity .8s ease, transform .8s ease; }
        .ct-reveal-right { opacity:0; transform:translateX(44px);  transition:opacity .8s ease, transform .8s ease; }
        .ct-reveal.visible, .ct-reveal-left.visible, .ct-reveal-right.visible { opacity:1; transform:none; }

        /* Contact info cards section — solid white */
        .ct-section-bg {
          background: #fff;
        }

        .ct-info-card {
          background: #fff;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 14px;
          padding: 22px 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: border-color .3s, transform .3s, box-shadow .3s;
        }
        .ct-info-card:hover {
          border-color: var(--color-gold);
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -12px rgba(0,0,0,0.15);
        }

        /* Form section — fixed bg image + dark, semi-transparent primary tint */
        .ct-form-section {
          position: relative;
          background-image: url('/contact-bg.jpg');
          background-attachment: fixed;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }
        .ct-form-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: color-mix(in srgb, var(--color-primary) 88%, transparent);
          z-index: 0;
        }
        .ct-form-section > * { position: relative; z-index: 1; }

        /* Glass cards inside the form section */
        .ct-context-card,
        .ct-form-card {
          background: color-mix(in srgb, var(--color-primary) 55%, transparent);
          border: 1px solid color-mix(in srgb, var(--color-gold) 25%, transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .ct-form-card {
          border-radius: 18px;
          padding: 40px 36px;
          box-shadow: 0 20px 40px -24px rgba(0,0,0,0.4);
        }

        .ct-input, .ct-select, .ct-textarea {
          width: 100%;
          background: rgba(0,0,0,0.20);
          border: 1px solid color-mix(in srgb, var(--color-gold) 25%, transparent);
          border-radius: 8px;
          padding: 13px 16px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color .25s, background .25s;
          box-sizing: border-box;
        }
        .ct-input::placeholder, .ct-textarea::placeholder { color: rgba(255,255,255,0.35); }
        .ct-input:focus, .ct-select:focus, .ct-textarea:focus {
          border-color: var(--color-gold);
          background: rgba(0,0,0,0.32);
        }
        .ct-select { appearance: none; cursor: pointer; }
        .ct-select option { background: var(--color-primary); color: #fff; }
        .ct-textarea { resize: vertical; min-height: 130px; }

        .ct-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 7px;
        }

        .ct-btn {
          width: 100%;
          background: var(--color-primary);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 15px 28px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background .2s, transform .15s;
        }
        .ct-btn:hover { background: var(--color-primary-light); transform: translateY(-2px); }
        .ct-btn:active { transform: translateY(0); }

        .ct-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: .22em;
          text-transform: uppercase; color: var(--color-gold);
        }

        @media (max-width: 900px) {
          .ct-2col { grid-template-columns: 1fr !important; gap: 36px !important; }
          .ct-2col-form { grid-template-columns: 1fr !important; }
          .ct-form-card { padding: 28px 20px !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden py-20 sm:py-28">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.webp')" }}
        />
        <div className="absolute inset-0 -z-10 bg-primary/90" />

        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <Reveal delay={0.05}>
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-7 bg-gold" />
              <span className="ct-eyebrow">Get in touch</span>
              <span className="h-px w-7 bg-gold" />
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              We&apos;re here to{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-gold-light), var(--color-gold))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                help
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.22}>
            <p className="mx-auto mt-4 max-w-lg text-white/70">
              Questions about a loan, repayments, or which product fits you?
              Reach out any way that works for you.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTACT INFO CARDS
      ══════════════════════════════════════════ */}
      <div className="ct-section-bg">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactItems.map(({ icon: Icon, label, value, sub, href, external }, i) => {
              const accent = i % 2 === 0 ? "var(--color-gold)" : "var(--color-primary-light)";
              const content = (
                <div className="ct-info-card">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary"
                    style={{ background: accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted/70">
                      {label}
                    </div>
                    <div className="mt-1 font-heading text-sm font-bold text-primary">
                      {value}
                    </div>
                    {sub && (
                      <div
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold"
                        style={{ color: accent }}
                      >
                        {sub}
                        {href && <ArrowRight className="h-3 w-3" />}
                      </div>
                    )}
                  </div>
                </div>
              );
              return (
                <Reveal key={label} delay={i * 0.08}>
                  {href ? (
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </Reveal>
              );
            })}
          </div>

          {/* Branches */}
          {siteConfig.branches.length > 0 && (
            <Reveal delay={0.26}>
              <div className="mt-5">
                <div className="font-mono text-[11px] font-semibold tracking-widest text-gold-light uppercase">
                  Our Branches
                </div>
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {siteConfig.branches.map((branch) => (
                    <div
                      key={branch.name}
                      className="rounded-2xl bg-white p-6"
                    >
                      <div className="font-heading text-base font-bold text-primary">
                        {branch.name}
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-muted">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span>{branch.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-gold" />
                          <a
                            href={`tel:${branch.phone.replace(/\s+/g, "")}`}
                            className="hover:text-primary"
                          >
                            {branch.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0 text-gold" />
                          <a
                            href={`mailto:${branch.email}`}
                            className="hover:text-primary"
                          >
                            {branch.email}
                          </a>
                        </div>
                        {branch.hours && (
                          <div className="flex items-start gap-2">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                            <span>{branch.hours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Working hours banner */}
          <Reveal delay={0.3}>
            <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-white p-7 sm:flex-row sm:items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold text-white">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <div className="font-mono text-[11px] font-semibold tracking-widest text-gold-light uppercase">
                  Working hours
                </div>
                <div className="mt-1.5 space-y-0.5 font-heading text-base font-bold text-primary sm:text-lg">
                  <div>Mon – Fri: 8:00 AM – 4:30 PM</div>
                  <div>Saturday: 8:00 AM – 1:00 PM</div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-primary/65">
                  {siteConfig.contact.hoursNote}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTEXT PANEL + FORM
      ══════════════════════════════════════════ */}
      <div className="ct-form-section px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="ct-2col grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.5fr]">
            {/* Left: context */}
            <Reveal dir="left">
              <p className="ct-eyebrow mb-3">Send a message</p>
              <div className="mb-5 h-1 w-11 rounded-full bg-gold" />
              <h2 className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Request a Callback or Ask a Question
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Whether you&apos;re exploring a personal loan, need help with a
                business application, or have a question about repayments —
                we&apos;re here to help. Fill in the form and one of our
                consultants will reach out promptly.
              </p>

              <div className="ct-context-card mt-7 rounded-2xl p-5">
                <div className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-gold-light">
                  What happens next
                </div>
                {[
                  "We review your enquiry within 24 hours",
                  "A loan consultant contacts you directly",
                  "We assess your application and prepare an offer",
                  "Funds disbursed once approved",
                ].map((step, i) => (
                  <div key={i} className={`flex items-start gap-3 ${i < 3 ? "mb-3" : ""}`}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary">
                      {i + 1}
                    </div>
                    <span className="pt-0.5 text-sm leading-relaxed text-white/75">{step}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Right: form */}
            <Reveal dir="right">
              <div className="ct-form-card">
                {submitted ? (
                  <div className="py-10 text-center">
                    <div className="mb-4 text-4xl">✅</div>
                    <h3 className="font-heading text-2xl font-extrabold text-white">
                      Message Sent!
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">
                      Thank you for reaching out. One of our consultants will be
                      in touch with you within 24 hours.
                    </p>
                    <button
                        className="ct-btn mt-7 w-auto px-8 py-3"
                        onClick={() => {
                            setSubmitted(false);
                            setForm({ name: "", employer: "", email: "", phone: "", enquiry: "", message: "" });
                        }}
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="ct-2col-form mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="ct-label">Full Name *</label>
                        <input className="ct-input" name="name" required placeholder="Bona Moyo" value={form.name} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="ct-label">Employer / Company</label>
                        <input className="ct-input" name="employer" placeholder="Your employer" value={form.employer} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="ct-2col-form mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="ct-label">Email Address *</label>
                        <input className="ct-input" name="email" type="email" required placeholder="tino05@gmail.com" value={form.email} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="ct-label">Phone Number</label>
                        <input className="ct-input" name="phone" type="tel" placeholder="+263 77 000 0000" value={form.phone} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="ct-label">Enquiry Type *</label>
                      <select className="ct-select" name="enquiry" required value={form.enquiry} onChange={handleChange}>
                        {loanTypes.map((t) => (
                          <option key={t} value={t === "Select enquiry type" ? "" : t} disabled={t === "Select enquiry type"}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-6">
                      <label className="ct-label">Message *</label>
                      <textarea
                        className="ct-textarea"
                        name="message"
                        required
                        placeholder="Tell us a bit about what you need, loan amount, timeline, and anything else that helps us prepare..."
                        value={form.message}
                        onChange={handleChange}
                      />
                    </div>

                    <button className="ct-btn" type="submit">
                      Send Enquiry →
                    </button>

                    <p className="mt-4 text-center text-[11px] leading-relaxed text-white/45">
                      Your information is kept confidential and only used to
                      respond to your enquiry. Prefer to apply directly?{" "}
                      <a href={siteConfig.applyHref} className="font-semibold text-gold-light">
                        Start full application
                      </a>
                      .
                    </p>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}