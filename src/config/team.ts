/*
  Plain team data — deliberately NOT in OurTeam.tsx, because that file
  is "use client" (it uses hooks for scroll-reveal and photo fallback
  state). A Server Component (like the Home page's Team.tsx) can safely
  render a client *component* imported from a "use client" file, but
  can't reliably read a plain data export (like an array) from one —
  it comes through as an opaque client reference on the server, not
  the actual array, which is what caused "TEAM.map is not a function".
  Keeping data here, with no "use client" directive, avoids that
  entirely: both server and client components can import TEAM directly
  as real data.

  Add more team members by following the same shape. Until a photo is
  added, cards fall back to initials (handled in OurTeam.tsx's
  TeamPhoto component) — drop a photo in /public/team/ and set `image`
  to that path whenever one's ready.
*/
export const TEAM = [
    {
      name: "Lloyd Tinashe Zhandire",
      title: "Finance & Administration Officer",
      bio: [
        "Lloyd Tinashe Zhandire is a Finance and Microfinance professional with over 6 years of experience in financial management, accounting, SME lending, credit risk management, portfolio growth, and business development. He currently serves as Finance & Administration Officer at Omama Finance Pvt Ltd, where he oversees financial reporting, accounting, financial controls, regulatory compliance, cash and treasury management, administration, and credit operations.",
        "Lloyd has previously held roles across finance, operations, credit, and business development within the microfinance sector. His experience includes financial reconciliations and reporting, budgeting and cash-flow management, strengthening internal controls, credit assessment, delinquency management, and portfolio growth. He has also contributed to developing credit risk frameworks, operational processes, reporting structures, and controls that promote efficiency and sustainable growth.",
        "He holds a Bachelor of Science Honours Degree in Accountancy from Chinhoyi University of Technology and a Certificate in Financial Statement Analysis and Microfinance from MFI Resources, UK. He is currently pursuing the ACCA qualification. Lloyd is passionate about financial inclusion, sound financial management, responsible lending, and the sustainable growth of financial services institutions.",
      ],
      image: "",
    },
    {
      name: "Bryan N Muzhingi",
      title: "Credit Risk Manager",
      bio: [
        "Bryan is a Credit Risk and Operations professional with a strong background in microfinance, lending, portfolio management, and financial risk analysis. He holds a BSc (Honours) Degree in Mathematics from Chinhoyi University of Technology and is currently pursuing the Financial Risk Manager (FRM) certification with the Global Association of Risk Professionals, bringing a quantitative approach to credit decisioning and further strengthening his expertise in financial risk management.",
        "As Credit Risk Manager at Omama Finance, Bryan is responsible for overseeing the institution's credit portfolio, developing and implementing credit policies, strengthening risk management frameworks, monitoring portfolio quality, and supporting sustainable lending decisions. He works closely with executive management and operational teams to ensure that the company maintains prudent risk standards while expanding access to finance for individuals and businesses.",
        "His expertise includes credit appraisal, portfolio risk analysis, collections and recoveries oversight, compliance support, data-driven decision making, and performance monitoring. Bryan is passionate about leveraging analytics and technology to improve financial inclusion, enhance operational performance, and build resilient financial institutions. He is committed to driving responsible lending practices and contributing to the long-term growth and stability of Omama Finance.",
      ],
      image: "",
    },
  ];
  
  export function getInitials(name: string) {
    const words = name.trim().split(/\s+/);
    const first = words[0]?.[0] ?? "";
    const last = words.length > 1 ? words[words.length - 1][0] : "";
    return (first + last).toUpperCase();
  }