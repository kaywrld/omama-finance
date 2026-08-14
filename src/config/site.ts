export const siteConfig = {
  name: "Omama",
  shortName: "Omama",
  description:
    "Empowering women and underserved communities with accessible, fair financial services.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  logo: {
    src: "/omama_logo.png",
    alt: "Omama logo",
    width: 220,
    height: 64,
  },
  contact: {
    phone: "+263 778 709 007",
    whatsapp: "263778709007",
    email: "info@omamafinance.co.zw",
    address: "Crn J Moyo & 1st Street, Galaxy Mall, 3rd Floor, Room 3, Harare, Zimbabwe",
    hoursNote:
    "Loan applications are accepted 24/7 : apply any time, we'll process it when we're back in office.",
  },
  // Placeholder social links — swap in the real profile URLs; leave any
  // entry pointing at "#" if that platform isn't set up yet.
  socials: {
    facebook: "#",
    instagram: "#",
    twitter: "#",
    linkedin: "#",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] as const,
  // Placeholder service names/hrefs/images — replace with the real product
  // lineup. Every item currently points at /loans until dedicated pages
  // exist; update hrefs/images here once those are ready, no component
  // changes needed.
  // Each service also carries the richer copy the /loans product page
  // needs: a longer `detail` paragraph, a short `features` list ("what's
  // included"), and a `stat` badge shown on the product image. Figures are
  // placeholders — swap in real numbers once they're confirmed.
  services: [
    {
      label: "Salary Based Loans",
      href: "/loans",
      description: "Quick loans for salaried employees, repaid from your income.",
      image: "/gov_loans.jpg",
      detail:
        "Built for salaried employees who need cash before payday. Approval is based on your income, not a lengthy credit check, and repayments come straight off your payroll so there's nothing to remember each month.",
      features: [
        "Repayments deducted straight from payroll",
        "Approved on your salary, not just your credit history",
        "Funds released within 24 hours of approval",
        "Flexible terms from 1 to 12 months",
      ],
      stat: { value: "24 hrs", label: "Average payout" },
    },
    {
      label: "Business Loans",
      href: "/loans",
      description: "Working capital and growth funding for small businesses.",
      image: "/business.webp",
      detail:
        "Working capital, stock financing, or equipment funding for small and growing businesses. We structure repayments around your real cash flow instead of a fixed calendar, so growth doesn't get stalled by a due date.",
      features: [
        "Working capital, stock, or equipment financing",
        "Repayment schedules built around your cash flow",
        "No collateral required on smaller facilities",
        "A dedicated contact through every stage of the loan",
      ],
      stat: { value: "US$50k", label: "Up to, per facility" },
    },
    {
      label: "Collateral Based Loans",
      href: "/loans",
      description: "Larger loans secured against an asset you own.",
      image: "/collateral.jpg",
      detail:
        "For when you need a larger facility. Securing the loan against property, a vehicle, or equipment you own unlocks lower rates and longer terms than an unsecured loan can offer.",
      features: [
        "Secure larger amounts against property, vehicles, or equipment",
        "Lower interest rates than unsecured lending",
        "Extended repayment terms, up to 36 months",
        "Independent, transparent asset valuation",
      ],
      stat: { value: "36 mo", label: "Maximum term" },
    },
    {
      label: "Micro Savings & Group Loans",
      href: "/loans",
      description: "Shared-liability savings and lending for groups and cooperatives.",
      image: "/group-loan.jpg",
      detail:
        "Shared-liability savings and lending built for groups, cooperatives, and chamas. Every cycle grows a savings pool alongside the loan, and peer accountability helps keep rates low for the whole group.",
      features: [
        "Shared-liability lending for groups and cooperatives",
        "Built-in savings component that grows each cycle",
        "Peer accountability keeps rates low for everyone",
        "A simple dashboard for group leaders to track members",
      ],
      stat: { value: "5+", label: "Members per group" },
    },
    {
      label: "Integrated Insurance Services",
      href: "/loans",
      description: "Insurance cover bundled alongside your loan for extra peace of mind.",
      image: "/integrated.webp",
      detail:
        "Loan protection and asset cover bundled alongside your loan, with no extra paperwork to fill out. It's optional cover for extra peace of mind, never a condition of approval.",
      features: [
        "Loan protection cover bundled with no extra paperwork",
        "Optional life and asset cover alongside your loan",
        "Claims handled in-house, not passed to a call centre",
        "Never a condition of loan approval",
      ],
      stat: { value: "100%", label: "Claims handled in-house" },
    },
  ],
  applyHref: "/apply",
};

export type SiteConfig = typeof siteConfig;