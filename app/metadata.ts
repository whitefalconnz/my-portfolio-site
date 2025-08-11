import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jakob's Portfolio",
  description:
    "Personal portfolio website showcasing animations, illustrations, and creative projects",
  metadataBase: new URL("https://jakobbackhouse.com"),
  openGraph: {
    type: "website",
    url: "https://jakobbackhouse.com/",
    title: "Jakob Backhouse Portfolio",
    description:
      "Design generalist with a focus on 2D frame by frame animation, creative advertising, and illustration.",
    images: [
      {
        url: "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_1.webp",
        width: 1200,
        height: 630,
        alt: "Creative Coding project thumbnail",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jakob Backhouse Portfolio",
    description:
      "Design generalist with a focus on 2D frame by frame animation, creative advertising, and illustration.",
    images: [
      "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_1.webp",
    ],
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        url: "/favicon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};
