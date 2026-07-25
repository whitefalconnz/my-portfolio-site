"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { getCDNUrl } from "../../utils/cdn";
import { useLoading } from "../../contexts/LoadingContext";

export default function Header() {
  const { theme, setTheme } = useTheme();
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
    <motion.header
      className={headerClasses}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isLoading ? 0 : 1, y: 0 }}
      transition={{
        duration: isLoading ? 0.2 : 0.4,
        delay: isLoading ? 0 : 0.1,
        ease: isLoading ? "easeIn" : "easeOut",
      }}
    >
      <div className="container mx-auto px-4 py-6 relative">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Main Navigation */}
          <motion.nav
            className="flex items-center space-x-8 w-1/3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: isLoading ? 0 : 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: isLoading ? 0 : 0.2,
              ease: "easeOut",
            }}
          >
            <Link
              href="/"
              className="retro-box px-5 py-3 font-satoshi text-lg text-dark dark:text-light hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300"
            >
              WORK
            </Link>
            <Link
              href="/about"
              className="font-satoshi text-dark dark:text-light hover:text-primary dark:hover:text-primary-light transition-all duration-300 text-base relative group"
            >
              <span className="relative">
                ABOUT
              </span>
            </Link>
            <Link
              href="/contact"
              className="font-satoshi text-dark dark:text-light hover:text-primary dark:hover:text-primary-light transition-all duration-300 text-base relative group"
            >
              <span className="relative">
                CONTACT
              </span>
            </Link>
          </motion.nav>

          {/* Center Logo/Name */}
          <motion.div
            className="flex items-center justify-center w-1/3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoading ? 0 : 1, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: isLoading ? 0 : 0.15,
              ease: "easeOut",
            }}
          >
            <Link
              href="/"
              className="font-display text-4xl lg:text-5xl font-bold text-primary dark:text-primary-light whitespace-nowrap hover:text-accent transition-colors"
            >
              Jakob's Portfolio
            </Link>
          </motion.div>

          {/* Profile Picture + Social Icons + Theme Toggle */}
          <motion.div
            className="flex items-center space-x-5 justify-end w-1/3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: isLoading ? 0 : 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: isLoading ? 0 : 0.3,
              ease: "easeOut",
            }}
          >
            <motion.div
              className="w-20 h-20 rounded-full overflow-hidden relative border border-line"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoading ? 0 : 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: isLoading ? 0 : 0.25,
                ease: "easeOut",
              }}
            >
              {!profileLoaded && (
                <div className="avatar-placeholder absolute inset-0 z-10" />
              )}
              <Link href="/about" className="block w-full h-full">
                <Image
                  src="https://media.jakobbackhouse.com/Img_and_Vid/SmokeProfile.webp"
                  alt="Profile"
                  width={400}
                  height={400}
                  className={`w-full h-full object-cover transition-all duration-300 relative z-20 ${
                    profileLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadingComplete={() => setProfileLoaded(true)}
                  onLoad={() => setProfileLoaded(true)}
                />
              </Link>
            </motion.div>

            {/* Theme toggle button */}
            {mounted && (
              <motion.button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isLoading ? 0 : 1, scale: 1 }}
                transition={{ duration: 0.4, delay: isLoading ? 0 : 0.35 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-6 h-6 text-ink hover:text-accent" />
                ) : (
                  <Moon className="w-6 h-6 text-ink hover:text-accent" />
                )}
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex items-center justify-between">
          {/* Hamburger Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-ink p-2"
            aria-label="Toggle menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isLoading ? 0 : 1, x: 0 }}
            transition={{ duration: 0.4, delay: isLoading ? 0 : 0.2 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-8 h-8" />
            ) : (
              <Menu className="w-8 h-8" />
            )}
          </motion.button>

          {/* Center Logo/Name */}
          <motion.div
            className="flex items-center gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoading ? 0 : 1, scale: 1 }}
            transition={{ duration: 0.4, delay: isLoading ? 0 : 0.15 }}
          >
            <Link
              href="/"
              className="font-display text-3xl md:text-4xl text-primary dark:text-primary-light hover:text-primary-hover dark:hover:text-primary-light/80 transition-colors"
            >
              <span className="font-medium tracking-tight">
                Jakob's Portfolio
              </span>
            </Link>
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden relative border border-line"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoading ? 0 : 1, scale: 1 }}
              transition={{ duration: 0.4, delay: isLoading ? 0 : 0.25 }}
            >
              {!profileLoaded && (
                <div className="avatar-placeholder absolute inset-0 z-10" />
              )}
              <Link href="/about" className="block w-full h-full">
                <Image
                  src="https://media.jakobbackhouse.com/Img_and_Vid/SmokeProfile.webp"
                  alt="Profile"
                  width={400}
                  height={400}
                  className={`w-full h-full object-cover transition-all duration-300 relative z-20 ${
                    profileLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoadingComplete={() => setProfileLoaded(true)}
                  onLoad={() => setProfileLoaded(true)}
                />
              </Link>
            </motion.div>
          </motion.div>

          {/* Theme Toggle */}
          {mounted && (
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3"
              aria-label="Toggle theme"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isLoading ? 0 : 1, x: 0 }}
              transition={{ duration: 0.4, delay: isLoading ? 0 : 0.3 }}
            >
              {theme === "dark" ? (
                <Sun className="w-6 h-6 text-ink hover:text-accent" />
              ) : (
                <Moon className="w-6 h-6 text-ink hover:text-accent" />
              )}
            </motion.button>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden absolute inset-x-0 top-full bg-primary dark:bg-primary z-[999] min-h-[calc(100vh-100px)] border-t border-line"
              initial={{ opacity: 0, y: -20, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, y: 0, backdropFilter: "blur(20px)" }}
              exit={{ opacity: 0, y: -20, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center pt-8 space-y-6">
                {/* Navigation Links */}
                <motion.nav
                  className="flex flex-col items-center space-y-8 text-xl font-satoshi"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1,
                    staggerChildren: 0.1,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href="/"
                      className="text-ground hover:bg-primary-hover transition-colors duration-200"
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      WORK
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Link
                      href="/about"
                      className="text-ground hover:bg-primary-hover transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ABOUT
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Link
                      href="/contact"
                      className="text-ground hover:bg-primary-hover transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      CONTACT
                    </Link>
                  </motion.div>
                </motion.nav>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
