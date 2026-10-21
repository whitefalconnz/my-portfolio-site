import type { Metadata } from "next";
import { SOCIAL_IMAGE } from "../metadata";

const DESCRIPTION =
  "About Jakob Backhouse, a Wellington-based designer and animator. Experience at Locales, MySafetyTV/Sharpdrive and AXIOM Training, with skills in illustration, storyboarding, UI, instructional and 3D environment design.";

// The page itself is a client component, so its metadata lives here. Canonical
// and Open Graph are set explicitly: both are inherited from the root layout
// otherwise, and an inherited canonical of "/" would tell search engines this
// page is a duplicate of the home page.
export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    url: "/about",
    siteName: "Jakob Backhouse",
    locale: "en_NZ",
    title: "About | Jakob Backhouse",
    description: DESCRIPTION,
    firstName: "Jakob",
    lastName: "Backhouse",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Jakob Backhouse",
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
