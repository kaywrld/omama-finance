"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Close the desktop Services dropdown on outside click or Escape.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the mobile menu whenever the route changes (e.g. a link was
  // followed). Adjusting state during render (rather than in an effect)
  // avoids an extra render pass — this is React's recommended pattern for
  // "reset state when a prop changes".
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setMobileServicesOpen(false);
  }

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
      <div className="flex h-20 w-full items-center justify-between px-3 sm:h-24 sm:px-4 lg:px-10 xl:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={siteConfig.name}>
          <Image
            src={siteConfig.logo.src}
            alt={siteConfig.logo.alt}
            width={siteConfig.logo.width}
            height={siteConfig.logo.height}
            priority
            className="h-18 w-auto sm:h-20"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <NavLink href="/" active={isActive("/")}>
            Home
          </NavLink>

          <div ref={servicesRef} className="relative">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((open) => !open)}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-base text-ink transition-colors hover:text-primary md:font-semibold"
            >
              Services
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {servicesOpen && (
              <div
                role="menu"
                className="absolute left-1/2 top-full mt-2 w-80 -translate-x-1/2 rounded-lg border border-border bg-white p-2 shadow-lg"
              >
                {siteConfig.services.map((service) => (
                  <Link
                    key={service.label}
                    href={service.href}
                    role="menuitem"
                    onClick={() => setServicesOpen(false)}
                    className="block rounded-md border-l-2 border-transparent px-3 py-2.5 transition-colors hover:border-gold hover:bg-paper"
                  >
                    <span className="block text-base font-medium text-primary">
                      {service.label}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {service.description}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {siteConfig.nav
            .filter((item) => item.href !== "/")
            .map((item) => (
              <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={siteConfig.applyHref}
            className="hidden rounded-md bg-gold px-5 py-2.5 text-base font-semibold text-primary transition-colors hover:bg-[color-mix(in_srgb,var(--color-gold)_85%,black)] sm:inline-flex"
          >
            Apply for a loan
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-primary md:hidden"
          >
            {mobileOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        {mobileOpen && (
          <nav
            aria-label="Primary"
            className="animate-[header-menu-in_150ms_ease-out] border-t border-border bg-paper px-3 pb-6 pt-2 sm:px-4"
          >
            <MobileLink href="/" active={isActive("/")}>
              Home
            </MobileLink>

            <div>
              <button
                type="button"
                aria-expanded={mobileServicesOpen}
                onClick={() => setMobileServicesOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-base font-medium text-ink"
              >
                Services
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileServicesOpen && (
                <div className="ml-3 border-l border-border pl-3">
                  {siteConfig.services.map((service) => (
                    <Link
                      key={service.label}
                      href={service.href}
                      className="block rounded-md px-3 py-2.5 text-base text-muted transition-colors hover:text-primary"
                    >
                      {service.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {siteConfig.nav
              .filter((item) => item.href !== "/")
              .map((item) => (
                <MobileLink key={item.href} href={item.href} active={isActive(item.href)}>
                  {item.label}
                </MobileLink>
              ))}

            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
              className="mt-2 flex items-center gap-2 rounded-md px-3 py-3 text-base text-muted"
            >
              <Phone size={18} aria-hidden="true" />
              {siteConfig.contact.phone}
            </a>

            <Link
              href={siteConfig.applyHref}
              className="mt-3 block rounded-md bg-gold px-4 py-3.5 text-center text-base font-semibold text-primary transition-colors hover:bg-[color-mix(in_srgb,var(--color-gold)_85%,black)]"
            >
              Apply for a loan
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-md px-3 py-2 text-base transition-colors md:font-semibold ${
        active ? "text-primary" : "text-ink hover:text-primary"
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold" />
      )}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-3 text-base font-medium transition-colors ${
        active ? "text-primary" : "text-ink"
      }`}
    >
      {children}
    </Link>
  );
}