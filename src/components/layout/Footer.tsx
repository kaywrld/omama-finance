import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "@/components/ui/SocialIcons";

const socials = [
  { label: "Facebook", href: siteConfig.socials.facebook, Icon: FacebookIcon },
  {
    label: "WhatsApp",
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    Icon: WhatsAppIcon,
  },
  { label: "Instagram", href: siteConfig.socials.instagram, Icon: InstagramIcon },
  { label: "Twitter", href: siteConfig.socials.twitter, Icon: TwitterIcon },
  { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: LinkedinIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-gold/20 bg-primary text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.7fr_1fr_1fr] md:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <Image
                src={siteConfig.logo.src}
                alt={siteConfig.logo.alt}
                width={siteConfig.logo.width}
                height={siteConfig.logo.height}
                className="h-14 w-auto"
              />
            </Link>

            <div className="mt-4 h-0.5 w-12 rounded-full bg-gold/45" />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {siteConfig.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-white/15 bg-white/8 text-white/65 transition-colors hover:border-gold hover:bg-gold hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="relative pb-3 font-mono text-xs font-bold uppercase tracking-widest text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-6 after:rounded-full after:bg-gold/55">
              Quick Links
            </h4>
            <ul className="mt-5 flex flex-col">
              {[...siteConfig.nav, { label: "Apply for a loan", href: siteConfig.applyHref }].map(
                (item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-1.5 rounded-md py-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3 w-3 -translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="relative pb-3 font-mono text-xs font-bold uppercase tracking-widest text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-6 after:rounded-full after:bg-gold/55">
              Contact
            </h4>
            <ul className="mt-5 flex flex-col gap-3.5">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gold/25 bg-gold/12">
                  <Phone className="h-3.5 w-3.5 text-gold-light" />
                </span>
                <div className="text-sm text-white/60">
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
                    className="text-white/85 transition-colors hover:text-gold-light"
                  >
                    {siteConfig.contact.phone}
                  </a>
                  <div className="mt-0.5 text-xs text-white/35">Call or WhatsApp</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gold/25 bg-gold/12">
                  <Mail className="h-3.5 w-3.5 text-gold-light" />
                </span>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-sm text-white/60 transition-colors hover:text-gold-light"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gold/25 bg-gold/12">
                  <MapPin className="h-3.5 w-3.5 text-gold-light" />
                </span>
                <span className="text-sm text-white/60">{siteConfig.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 px-4 py-4 text-center text-xs text-white/40 sm:px-6">
        © {year} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}