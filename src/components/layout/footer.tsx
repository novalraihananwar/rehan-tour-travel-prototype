import Link from 'next/link'
import { Instagram, Youtube, Facebook, Mail, Phone, MapPin, Send } from 'lucide-react'

const footerLinks = {
  Destinations: [
    { label: 'Mount Bromo', href: '/destinations/mount-bromo' },
    { label: 'Ijen Crater', href: '/destinations/ijen-crater' },
    { label: 'Tumpak Sewu', href: '/destinations/tumpak-sewu-waterfall' },
    { label: 'Ubud Bali', href: '/destinations/ubud' },
    { label: 'Nusa Penida', href: '/destinations/nusa-penida' },
    { label: 'Uluwatu', href: '/destinations/uluwatu' },
  ],
  'Tour Packages': [
    { label: 'Bromo Sunrise Tour', href: '/packages/bromo-sunrise-tour' },
    { label: 'Bromo + Ijen Expedition', href: '/packages/bromo-ijen-expedition' },
    { label: 'Surabaya → Bali', href: '/packages/surabaya-bali-overland' },
    { label: 'Bali Tropical Escape', href: '/packages/bali-tropical-escape' },
    { label: 'Luxury East Java', href: '/packages/luxury-east-java-escape' },
    { label: 'Honeymoon Package', href: '/packages/honeymoon-tropical-bali' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Fleet', href: '/fleet' },
    { label: 'Blog', href: '/blog' },
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Facebook, href: '#', label: 'Facebook' },
]

const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'QRIS', 'Bank Transfer', 'Xendit']

export function Footer() {
  return (
    <footer className="relative bg-volcanic border-t border-white/6 overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sunset to-gold rounded-xl flex items-center justify-center">
                <span className="text-volcanic font-bold font-display text-lg">R</span>
              </div>
              <div>
                <div className="font-display text-xl text-cream">Rehan Tour & Travel</div>
                <div className="text-xs text-cream-muted tracking-widest uppercase">East Java & Bali</div>
              </div>
            </Link>

            <p className="text-cream-muted text-sm leading-relaxed mb-6 max-w-sm">
              Premium cinematic adventures across East Java and Bali. 30 Toyota HiAce vehicles, expert guides, and unforgettable experiences since 2018.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Phone, text: '+62 812-3456-7890 (WhatsApp)' },
                { icon: Mail, text: 'hello@rehantour.id' },
                { icon: MapPin, text: 'Jl. Raya Bromo No.1, Surabaya, East Java' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-sunset mt-0.5 shrink-0" />
                  <span className="text-sm text-cream-muted">{text}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-sunset/15 border border-white/8 hover:border-sunset/30 flex items-center justify-center text-cream-muted hover:text-sunset transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-cream font-medium text-sm mb-5 tracking-wide">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream-muted hover:text-sunset transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-white/6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl text-cream mb-1">Get travel inspiration</h3>
              <p className="text-sm text-cream-muted">Hidden gems, departure alerts, and exclusive deals — straight to your inbox.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-dark flex-1 md:w-72 text-sm py-2.5"
              />
              <button className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap">
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="py-6 border-t border-white/6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-cream-muted">Secure payment methods accepted:</p>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="px-3 py-1 rounded-lg text-xs text-cream-muted bg-white/5 border border-white/8"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream-muted">
            © 2026 Rehan Tour & Travel. All rights reserved. Licensed by Ministry of Tourism Indonesia.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-cream-muted">🇮🇩 Made with love in East Java</span>
            <div className="flex gap-1">
              {['🌋', '🏝️', '🌊', '🦅'].map((e) => (
                <span key={e} className="text-sm">{e}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
