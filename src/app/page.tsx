'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Compass, Mountain, Waves, Map } from 'lucide-react'
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero'
import { Spotlight } from '@/components/ui/spotlight'
import { StatsSection } from '@/components/sections/stats-section'
import { DestinationsGrid } from '@/components/sections/destinations-grid'
import { PackagesShowcase } from '@/components/sections/packages-showcase'
import { RouteMap } from '@/components/sections/route-map'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { FleetSection } from '@/components/sections/fleet-section'
import { CountdownSection } from '@/components/sections/countdown-section'
import { BlogSection } from '@/components/sections/blog-section'

const heroFeatures = [
  { icon: Mountain, label: 'Volcanoes', desc: 'Bromo & Ijen' },
  { icon: Waves, label: 'Waterfalls', desc: 'Tumpak Sewu' },
  { icon: Map, label: 'Overland', desc: 'Java → Bali' },
  { icon: Compass, label: 'Exploration', desc: 'Off-the-beaten' },
]

function HeroContent() {
  return (
    <div className="min-h-screen bg-volcanic relative overflow-hidden">
      {/* Spotlight effect (from component 1.txt) */}
      <div className="h-[40rem] w-full flex items-center justify-center bg-volcanic relative overflow-hidden -mt-px">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#E8703A" />

        {/* Trust indicators marquee */}
        <div className="absolute top-8 left-0 right-0 overflow-hidden">
          <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
            {['🇯🇵 Japan', '🇩🇪 Germany', '🇦🇺 Australia', '🇰🇷 Korea', '🇺🇸 USA', '🇫🇷 France', '🇬🇧 UK', '🇨🇳 China', '🇪🇸 Spain', '🇳🇱 Netherlands', '🇯🇵 Japan', '🇩🇪 Germany', '🇦🇺 Australia', '🇰🇷 Korea', '🇺🇸 USA', '🇫🇷 France', '🇬🇧 UK', '🇨🇳 China', '🇪🇸 Spain', '🇳🇱 Netherlands'].map((country, i) => (
              <span key={i} className="text-sm text-cream-muted">{country}</span>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-sunset" />
            <span className="text-xs text-sunset uppercase tracking-[0.3em] font-medium">
              Premium Cinematic Travel
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-sunset" />
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-cream-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Door-to-door overland journeys from Surabaya to Bali.
            <br className="hidden md:block" />
            Bromo sunrise, Ijen blue fire, Tumpak Sewu — one seamless adventure.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link href="/packages" className="btn-primary text-base px-8 py-4">
              Explore Packages <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/destinations" className="btn-ghost text-base px-8 py-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-sunset" />
              View Destinations
            </Link>
          </motion.div>

          {/* Feature icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="grid grid-cols-4 gap-6 md:gap-10"
          >
            {heroFeatures.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-sunset/12 border border-sunset/20 flex items-center justify-center group-hover:bg-sunset/20 group-hover:border-sunset/40 transition-all duration-300">
                  <f.icon className="w-4.5 h-4.5 text-sunset" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-cream">{f.label}</div>
                  <div className="text-xs text-cream-muted">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Destination preview strip */}
      <div className="relative py-12 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-volcanic to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-volcanic to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 animate-marquee">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex gap-4 shrink-0">
              {[
                { src: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=400&q=75', label: 'Mount Bromo' },
                { src: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=75', label: 'Tumpak Sewu' },
                { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=75', label: 'Bali Rice Terraces' },
                { src: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&q=75', label: 'Uluwatu' },
                { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=75', label: 'Banyuwangi Beach' },
                { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75', label: 'Ijen Crater' },
                { src: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=75', label: 'Nusa Penida' },
                { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75', label: 'Tanah Lot' },
              ].map((img) => (
                <div
                  key={img.label}
                  className="relative w-48 h-32 rounded-2xl overflow-hidden shrink-0 group"
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic/70 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs text-cream font-medium">{img.label}</span>
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
    <>
      {/* Cinematic Scroll Hero (from component 3.txt) */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=85"
        bgImageSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
        title="DISCOVER EXTRAORDINARY"
        date="East Java & Bali"
        scrollToExpand="↓ Scroll to explore"
        textBlend={false}
      >
        <HeroContent />
      </ScrollExpandMedia>

      {/* Stats */}
      <StatsSection />

      {/* Destinations */}
      <DestinationsGrid />

      {/* Countdown / Live departures */}
      <CountdownSection />

      {/* Packages */}
      <PackagesShowcase />

      {/* Interactive Route Map */}
      <RouteMap />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Fleet */}
      <FleetSection />

      {/* Blog */}
      <BlogSection />

      {/* Final CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=70"
            alt="Mount Bromo"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-volcanic via-volcanic/80 to-volcanic/60" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs text-sunset uppercase tracking-widest mb-4">Book In 3 Minutes</p>
            <h2 className="font-display text-display-xl text-cream mb-6">
              Pick a Date.<br />
              <span className="text-gradient-sunset">We Handle Everything Else.</span>
            </h2>
            <p className="text-cream-muted text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              No agency fees, no account required. Share your WhatsApp and email — we'll confirm your seat, send your itinerary PDF, and meet you at the door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="btn-primary text-base px-10 py-4">
                Book Your Adventure <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/packages" className="btn-ghost text-base px-10 py-4">
                Browse Packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
