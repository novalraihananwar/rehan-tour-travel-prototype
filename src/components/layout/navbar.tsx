'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { languages } from '@/lib/data'
import { useLanguage, type LangCode } from '@/lib/i18n'

export function Navbar() {
  const { t, lang, setLang } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)

  const currentLang = languages.find((l) => l.code === lang) ?? languages[0]

  const navLinks = [
    {
      label: t.nav.destinations,
      href: '/destinations',
      children: [
        { label: t.nav.eastJava, href: '/destinations?region=east-java' },
        { label: t.nav.bali, href: '/destinations?region=bali' },
        { label: 'Mount Bromo', href: '/destinations/mount-bromo' },
        { label: 'Ijen Crater', href: '/destinations/ijen-crater' },
        { label: 'Ubud', href: '/destinations/ubud' },
      ],
    },
    {
      label: t.nav.packages,
      href: '/packages',
      children: [
        { label: t.nav.allPackages, href: '/packages' },
        { label: 'Bromo + Ijen', href: '/packages/bromo-ijen-expedition' },
        { label: 'Surabaya → Bali', href: '/packages/surabaya-bali-overland' },
        { label: 'Bali Escape', href: '/packages/bali-tropical-escape' },
        { label: 'Luxury Tours', href: '/packages/luxury-east-java-escape' },
      ],
    },
    { label: t.nav.blog, href: '/blog' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLangSelect = (code: string) => {
    setLang(code as LangCode)
    setLangOpen(false)
    setMobileOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-sunset to-gold rounded-xl group-hover:shadow-glow-sunset transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-volcanic font-bold text-sm font-display">R</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-lg text-cream leading-none tracking-wide">Rehan</div>
                <div className="text-xs text-cream-muted tracking-[0.2em] uppercase">Tour & Travel</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-sm text-cream-dark hover:text-cream transition-colors duration-200 group"
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className="w-3 h-3 text-cream-muted group-hover:text-sunset transition-colors" />
                    )}
                  </Link>
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-52 glass rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/8"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-3 text-sm text-cream-dark hover:text-cream hover:bg-white/5 transition-colors border-b border-white/4 last:border-0"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-cream-muted hover:text-cream transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-44 glass rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/8 z-50"
                    >
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => handleLangSelect(l.code)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-b border-white/4 last:border-0 ${
                            lang === l.code
                              ? 'text-sunset bg-sunset/8'
                              : 'text-cream-dark hover:text-cream hover:bg-white/5'
                          }`}
                        >
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Book Now CTA */}
              <Link
                href="/booking"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-volcanic bg-sunset-gradient transition-all duration-300 hover:shadow-glow-sunset hover:-translate-y-0.5"
              >
                {t.nav.bookNow}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-cream-dark hover:text-cream transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-volcanic/95 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10 flex flex-col h-full pt-24 px-6 pb-8 overflow-y-auto">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-white/8"
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-4 font-display text-2xl text-cream hover:text-sunset transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="pb-3 pl-4 space-y-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block text-sm text-cream-muted hover:text-sunset transition-colors py-1"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Language selector mobile */}
              <div className="mt-6">
                <p className="text-xs text-cream-muted uppercase tracking-widest mb-3">Language</p>
                <div className="grid grid-cols-4 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLangSelect(l.code)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors ${
                        lang === l.code
                          ? 'bg-sunset/15 text-sunset border border-sunset/25'
                          : 'bg-white/4 text-cream-muted border border-white/8'
                      }`}
                    >
                      <span className="text-lg">{l.flag}</span>
                      <span>{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="mt-8 btn-primary justify-center text-base py-4"
              >
                {t.nav.bookNow}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
