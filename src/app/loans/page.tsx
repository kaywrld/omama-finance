import type { Metadata } from "next";
import { ServicesShowcase } from "@/components/loans/ServicesShowcase";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Omama Finance's full range of loan and insurance products, from salary-based loans to group lending, and apply online in minutes.",
};

export default function LoansPage() {
  return <ServicesShowcase />;
}