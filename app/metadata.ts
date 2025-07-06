import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jakob's Portfolio",
  description: "Personal portfolio website showcasing animations, illustrations, and creative projects",
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/favicon-16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};
