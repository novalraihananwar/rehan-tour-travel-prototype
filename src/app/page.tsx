'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero'
import { Spotlight } from '@/components/ui/spotlight'
import { StatsSection } from '@/components/sections/stats-section'
import { DestinationsGrid } from '@/components/sections/destinations-grid'
import { PackagesShowcase } from '@/components/sections/packages-showcase'
import { RouteMap } from '@/components/sections/route-map'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CountdownSection } from '@/components/sections/countdown-section'
import { BlogSection } from '@/components/sections/blog-section'

const nationalities = [
  'Japan', 'Germany', 'Australia', 'South Korea', 'United States',
  'France', 'United Kingdom', 'Netherlands', 'Spain', 'Canada',
  'Switzerland', 'Sweden', 'Singapore', 'New Zealand', 'Italy',
]

const destinationStrip = [
  { src: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=400&q=75', label: 'Mount Bromo' },
  { src: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=75', label: 'Tumpak Sewu' },
  { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=75', label: 'Bali Rice Terraces' },
  { src: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&q=75', label: 'Uluwatu' },
  { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=75', label: 'Banyuwangi Beach' },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75', label: 'Kawah Ijen' },
  { src: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=75', label: 'Nusa Penida' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75', label: 'Tanah Lot' },
]

function HeroContent() {
  return (
    <div className="min-h-screen bg-volcanic relative overflow-hidden">
      <div className="h-[44rem] w-full flex items-center justify-center bg-volcanic relative overflow-hidden -mt-px">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#E8703A" />

        {/* Nationality marquee — text only, no emojis */}
        <div className="absolute top-6 left-0 right-0 overflow-hidden opacity-40">
          <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
            {[...nationalities, ...nationalities].map((country, i) => (
              <span key={i} className="text-xs text-cream-muted font-sans tracking-[0.15em] uppercase">
                {country}
              </span>
            ))}
          </div>
        </div>

        {/* Main content — cinematic center layout */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 w-full max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-sunset" />
            <span className="text-xs text-sunset tracking-[0.35em] font-medium uppercase">
              East Java &amp; Bali
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-sunset" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-cream-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-12"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Door-to-door overland journeys from Surabaya to Bali.
            Bromo sunrise, Ijen blue fire, Tumpak Sewu — fully escorted.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/packages" className="btn-primary text-base px-10 py-4">
              Explore Packages <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/destinations" className="btn-ghost text-base px-10 py-4">
              View Destinations
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Destination image strip */}
      <div className="relative py-10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-volcanic to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-volcanic to-transparent z-10 pointer-events-none" />
        <div className="flex gap-4 animate-marquee">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex gap-4 shrink-0">
              {destinationStrip.map((img) => (
                <div key={img.label} className="relative w-52 h-36 rounded-2xl overflow-hidden shrink-0 group">
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 text-xs text-cream font-medium tracking-wide">{img.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="overflow-x-hidden w-full max-w-full">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=85"
        bgImageSrc="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=80"
        title="DISCOVER EXTRAORDINARY"
        date="East Java & Bali"
        scrollToExpand="Scroll to explore"
        textBlend={false}
      >
        <HeroContent />
      </ScrollExpandMedia>

      <StatsSection />
      <DestinationsGrid />
      <CountdownSection />
      <PackagesShowcase />
      <RouteMap />
      <TestimonialsSection />
      <BlogSection />

      {/* Final CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=70"
            alt="Mount Bromo at sunrise"
            fill
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-volcanic via-volcanic/85 to-volcanic/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs text-sunset tracking-[0.35em] uppercase mb-6">Ready when you are</p>
            <h2 className="font-display text-display-xl text-cream mb-6" style={{ textWrap: 'balance' } as React.CSSProperties}>
              Pick a date.{' '}
              <span className="text-gradient-sunset">We handle everything else.</span>
            </h2>
            <p className="text-cream-muted text-lg mb-12 leading-relaxed max-w-xl mx-auto">
              No agency fees. No account required. Share your WhatsApp — we confirm your seat,
              send your itinerary, and meet you at the door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="btn-primary text-base px-10 py-4">
                Book your adventure <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/packages" className="btn-ghost text-base px-10 py-4">
                Browse packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
