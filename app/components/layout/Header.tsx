"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from 'framer-motion'
import { getCDNUrl } from '../../utils/cdn'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [bounceStyle, setBounceStyle] = useState({})
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollDelta = lastScrollY - currentScrollY
          
          if (scrollDelta > 15) { // Increased threshold for more intentional triggers
            // Simpler transform that moves the header slightly up and adds a subtle scale
            setBounceStyle({
              transform: 'translateY(-2px) scaleY(1.02)',
              transition: 'transform 0.15s ease-out',
              borderBottomWidth: '3px' // Slightly thicker border during effect
            })
            
            // Reset with a smoother transition
            setTimeout(() => {
              setBounceStyle({
                transform: 'translateY(0) scaleY(1)',
                transition: 'transform 0.2s ease-in-out',
                borderBottomWidth: '2px'
              })
            }, 150)
          }
          
          setIsScrolled(currentScrollY > 0)
          lastScrollY = currentScrollY
          ticking = false
        })
        
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerClasses = `
    fixed top-0 left-0 right-0 
    backdrop-blur z-50 
    border-b-2 border-black dark:border-white
    transition-colors duration-300
    ${isScrolled ? 'bg-[#F3F1E9]/90 dark:bg-[#1A1818]/90' : 'bg-[#F3F1E9]/75 dark:bg-[#1A1818]/75'}
  `.trim()

  return (
    <header className={headerClasses} style={bounceStyle}>
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Main Navigation */}
          <nav className="flex items-center space-x-8 w-1/3">
            <Link 
              href="/" 
              className="retro-box px-4 py-2 font-mono text-dark dark:text-light hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300"
            >
              WORK
            </Link>
            <Link 
              href="/about" 
              className="font-mono text-dark dark:text-light hover:text-primary dark:hover:text-primary-light transition-all duration-300 text-sm relative group"
            >
              <span className="relative">
                ABOUT
                <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-primary dark:bg-primary-light transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </Link>
            <Link 
              href="/contact" 
              className="font-mono text-dark dark:text-light hover:text-primary dark:hover:text-primary-light transition-all duration-300 text-sm relative group"
            >
              <span className="relative">
                CONTACT
                <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-primary dark:bg-primary-light transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </Link>
          </nav>

          {/* Center Logo/Name */}
          <div className="flex items-center gap-4 justify-center w-1/3">
            <Link 
              href="/" 
              className="font-mono text-2xl font-bold text-primary dark:text-primary-light whitespace-nowrap"
            >
              Jakob's Portfolio
            </Link>
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <Image
                src={getCDNUrl("/Img_and_Vid/WebsitePortfolio.jpg")}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Social Icons + Theme Toggle */}
          <div className="flex items-center space-x-4 justify-end w-1/3">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#332A2A] dark:text-[#F5F5F5] hover:text-[#B14038] dark:hover:text-[#FF6B61] transition-all duration-300 transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#332A2A] dark:text-[#F5F5F5] hover:text-[#B14038] dark:hover:text-[#FF6B61] transition-all duration-300 transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            
            {/* Theme toggle button */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-[#F5F5F5] hover:text-[#FF6B61]" />
                ) : (
                  <Moon className="w-5 h-5 text-[#332A2A] hover:text-[#B14038]" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex items-center justify-between">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#332A2A] dark:text-[#F5F5F5]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Center Logo/Name */}
          <div className="flex items-center gap-2 justify-center">
            <Link 
              href="/" 
              className="font-mono text-lg md:text-xl text-primary dark:text-primary-light hover:text-primary-hover dark:hover:text-primary-light/80 transition-colors"
            >
              <span className="font-bold tracking-tight">Jakob Backhouse</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <Image
                src="/placeholder.svg"
                alt="Profile"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#F5F5F5] hover:text-[#FF6B61]" />
              ) : (
                <Moon className="w-5 h-5 text-[#332A2A] hover:text-[#B14038]" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[73px] bottom-0 bg-primary dark:bg-primary z-[999] min-h-[calc(100vh-73px)]">
            <div className="flex flex-col items-center pt-8 space-y-6">
              {/* Navigation Links */}
              <nav className="flex flex-col items-center space-y-6 text-lg">
                <Link 
                  href="/" 
                  className="text-white dark:text-black hover:bg-primary-hover transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  WORK
                </Link>
                <Link 
                  href="/about" 
                  className="text-white dark:text-black hover:bg-primary-hover transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ABOUT
                </Link>
                <Link 
                  href="/contact" 
                  className="text-white dark:text-black hover:bg-primary-hover transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CONTACT
                </Link>
              </nav>

              {/* Social Icons */}
              <div className="flex space-x-6 pt-6">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white dark:text-black hover:bg-primary-hover transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white dark:text-black hover:bg-primary-hover transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}