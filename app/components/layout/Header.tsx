"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useLoading } from "../../contexts/LoadingContext";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // The outline marks the page you're on. It used to sit permanently on WORK,
  // which testers read as "you are here" on every page; now it follows the
  // current page. Every link carries the same padding and a transparent border,
  // so nothing shifts sideways when the outline moves.
  const navLinkClass = (href: string) =>
    `px-5 py-3 border font-satoshi text-dark dark:text-light transition-colors duration-300 ${
      pathname === href ? "border-line" : "border-transparent"
    }`;
  // Each part of the header fades in once the first-load screen lifts, a
  // beat apart. Plain CSS transitions: these used to be framer-motion
  // elements, which put that whole library in every page's first download.
  // The colour transitions are restated because an inline `transition`
  // replaces the ones the classes set.
  const fadeIn = (delay: number): CSSProperties => ({
    opacity: isLoading ? 0 : 1,
    transition: `opacity ${isLoading ? "0.2s ease-in 0s" : `0.4s ease-out ${delay}s`}, color 0.15s, background-color 0.15s, border-color 0.15s`,
  });
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const { isLoading } = useLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fully opaque, no blur and no bottom rule -- the header reads as solid
  // ground rather than a translucent pane floating over the work.
  const headerClasses = `
    sticky top-0 left-0 right-0
    z-[200] bg-ground
    ${isLoading ? "pointer-events-none" : "pointer-events-auto"}
  `.trim();

  return (
    <header
      className={headerClasses}
      style={fadeIn(0.1)}
>
      {/* Both rows clip sideways so their slide-in can't add a brief horizontal
          scrollbar. Don't clip this container: the mobile menu hangs below it. */}
      <div className="container mx-auto px-4 py-6 relative">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between overflow-x-clip">
          {/* Main Navigation */}
          <nav
            className="flex items-center space-x-3 w-1/3"
            style={fadeIn(0.2)}
>
            <Link
              href="/"
              className={`${navLinkClass("/")} text-lg`}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              WORK
            </Link>
            <Link
              href="/about"
              className={`${navLinkClass("/about")} text-base`}
              aria-current={pathname === "/about" ? "page" : undefined}
            >
              ABOUT
            </Link>
            <Link
              href="/contact"
              className={`${navLinkClass("/contact")} text-base`}
              aria-current={pathname === "/contact" ? "page" : undefined}
            >
              CONTACT
            </Link>
          </nav>

          {/* Center Logo/Name */}
          <div
            className="flex items-center justify-center w-1/3"
            style={fadeIn(0.15)}
>
            <Link
              href="/"
              className="font-display text-4xl xl:text-5xl font-bold text-ink whitespace-nowrap hover:text-accent transition-colors"
            >
              Jakob Backhouse
            </Link>
          </div>

          {/* Profile Picture + Social Icons + Theme Toggle */}
          <div
            className="flex items-center space-x-5 justify-end w-1/3"
            style={fadeIn(0.3)}
>
            <div
              className="w-20 h-20 rounded-full overflow-hidden relative border border-line"
              style={fadeIn(0.25)}
>
              {!profileLoaded && (
                <div className="avatar-placeholder absolute inset-0 z-10" />
              )}
              <Link href="/about" className="block w-full h-full">
                <Image
                  src="https://media.jakobbackhouse.com/Img_and_Vid/SmokeProfile.webp"
                  alt="Jakob Backhouse"
                  width={80}
                  height={80}
                  className={`w-full h-full object-cover transition-all duration-300 relative z-20 ${
                    profileLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadingComplete={() => setProfileLoaded(true)}
                  onLoad={() => setProfileLoaded(true)}
                />
              </Link>
            </div>

            {/* Theme toggle button */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
                style={fadeIn(0.35)}
>
                {theme === "dark" ? (
                  <Sun className="w-6 h-6 text-ink hover:text-accent" />
                ) : (
                  <Moon className="w-6 h-6 text-ink hover:text-accent" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex items-center justify-between overflow-x-clip">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-ink p-2"
            aria-label="Toggle menu"
            style={fadeIn(0.2)}
>
            {isMobileMenuOpen ? (
              <X className="w-8 h-8" />
            ) : (
              <Menu className="w-8 h-8" />
            )}
          </button>

          {/* Center Logo/Name */}
          <div
            className="flex items-center gap-4 justify-center"
            style={fadeIn(0.15)}
>
            <Link
              href="/"
              className="font-display text-3xl md:text-4xl text-ink hover:text-accent transition-colors"
            >
              <span className="font-medium tracking-tight">
                Jakob Backhouse
              </span>
            </Link>
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden relative border border-line"
              style={fadeIn(0.25)}
>
              {!profileLoaded && (
                <div className="avatar-placeholder absolute inset-0 z-10" />
              )}
              <Link href="/about" className="block w-full h-full">
                <Image
                  src="https://media.jakobbackhouse.com/Img_and_Vid/SmokeProfile.webp"
                  alt="Jakob Backhouse"
                  width={80}
                  height={80}
                  className={`w-full h-full object-cover transition-all duration-300 relative z-20 ${
                    profileLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadingComplete={() => setProfileLoaded(true)}
                  onLoad={() => setProfileLoaded(true)}
                />
              </Link>
            </div>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3"
              aria-label="Toggle theme"
              style={fadeIn(0.3)}
>
              {theme === "dark" ? (
                <Sun className="w-6 h-6 text-ink hover:text-accent" />
              ) : (
                <Moon className="w-6 h-6 text-ink hover:text-accent" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute inset-x-0 top-full bg-primary dark:bg-primary z-[999] min-h-[calc(100vh-100px)] border-t border-line">
              <div className="flex flex-col items-center pt-8 space-y-6">
                {/* Navigation Links. No entry transition -- the menu appears. */}
                <nav className="flex flex-col items-center space-y-8 text-xl font-satoshi">
                  <Link
                    href="/"
                    className="text-ground hover:bg-primary-hover transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    WORK
                  </Link>
                  <Link
                    href="/about"
                    className="text-ground hover:bg-primary-hover transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ABOUT
                  </Link>
                  <Link
                    href="/contact"
                    className="text-ground hover:bg-primary-hover transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    CONTACT
                  </Link>
                </nav>
              </div>
            </div>
          )}
      </div>
    </header>
  );
}
