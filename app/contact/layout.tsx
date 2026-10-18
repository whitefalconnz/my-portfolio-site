import type { Metadata } from "next";
import { SOCIAL_IMAGE } from "../metadata";

const DESCRIPTION =
  "Contact Jakob Backhouse, a Wellington-based designer and animator, about animation, illustration and design projects or collaborations.";

// See app/about/layout.tsx: the page is a client component, and canonical /
// Open Graph must be set here or they'd be inherited from the home page.
export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    siteName: "Jakob Backhouse",
    locale: "en_NZ",
    title: "Contact — Jakob Backhouse",
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Jakob Backhouse",
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
