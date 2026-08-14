import type { Metadata } from "next";
import AboutClient from "@/components/about/AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Omama Finance — our story, mission, and the fast, fair loans we build for individuals and small businesses across Zimbabwe.",
};

export default function AboutPage() {
  return <AboutClient />;
}