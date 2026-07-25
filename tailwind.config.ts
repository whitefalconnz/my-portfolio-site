import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core palette. Defined as CSS variables in globals.css so a single
        // `.dark` toggle swaps the whole identity.
        ground: 'var(--ground)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        accent: {
          DEFAULT: 'var(--accent)',
          alt: 'var(--accent-alt)',
          contrast: 'var(--accent-contrast)',
        },

        background: 'var(--ground)',
        foreground: 'var(--ink)',

        // These four were referenced in ~40 places but never defined, so every
        // one of those classes silently did nothing. Mapped to real tokens now.
        primary: {
          DEFAULT: 'var(--ink)',
          light: 'var(--ink)',
          hover: 'var(--accent)',
          foreground: 'var(--ground)',
        },
        secondary: {
          DEFAULT: 'var(--muted-ink)',
          light: 'var(--muted-ink)',
        },
        muted: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--muted-ink)',
        },

        // `text-dark dark:text-light` appears 28 times and neither existed.
        // Both resolve to the same token, since --ink already flips per theme.
        dark: 'var(--ink)',
        light: 'var(--ink)',

        // Used by app/components/ui/card.tsx, also never defined.
        card: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--ink)',
        },
        destructive: {
          DEFAULT: '#D63A2F',
          foreground: '#FFFFFF',
        },
      },
      borderColor: {
        DEFAULT: 'var(--line)',
      },
      fontFamily: {
        // Two families total: Satoshi for everything readable, Geist Mono for
        // labels and data. Both already vendored in app/fonts.
        satoshi: ['var(--font-satoshi)', 'ui-sans-serif', 'sans-serif'],
        sans: ['var(--font-satoshi)', 'ui-sans-serif', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
