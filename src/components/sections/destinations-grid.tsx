'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { destinations } from '@/lib/data'

const tabs = ['All', 'East Java', 'Bali'] as const
type Tab = typeof tabs[number]

const difficultyColor: Record<string, string> = {
  Easy: 'bg-jungle/15 text-jungle-light border-jungle/25',
  Moderate: 'bg-gold/15 text-gold border-gold/25',
  Challenging: 'bg-sunset/15 text-sunset border-sunset/25',
}

export function DestinationsGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activeTab, setActiveTab] = useState<Tab>('All')

  const filtered = destinations.filter((d) => {
    if (activeTab === 'East Java') return d.region === 'east-java'
    if (activeTab === 'Bali') return d.region === 'bali'
    return true
  }).slice(0, 6)

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="section-header"
        >
          <p className="section-eyebrow">Explore Destinations</p>
          <h2 className="section-title">
            East Java & Bali —<br />
            <span className="text-gradient-sunset">28 Destinations, One Trip</span>
          </h2>
          <p className="section-subtitle">
            Active volcanoes, 120-metre waterfalls, sacred sea temples, and rice-terrace valleys. Every destination is reachable by Toyota HiAce from your hotel door.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-12"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-sunset to-gold text-volcanic shadow-glow-sunset'
                  : 'text-cream-muted hover:text-cream border border-white/10 hover:border-sunset/25'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filtered.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
            >
              <Link href={`/destinations/${dest.slug}`} className="destination-card block group">
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic-200 via-transparent to-transparent" />

                  {/* Region badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-sm ${
                      dest.region === 'east-java'
                        ? 'bg-jungle/20 text-jungle-light border-jungle/30'
                        : 'bg-ocean/20 text-ocean-light border-ocean/30'
                    }`}>
                      {dest.region === 'east-java' ? '🌋 East Java' : '🏝️ Bali'}
                    </span>
                  </div>

                  {/* Difficulty */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-sm ${difficultyColor[dest.difficulty]}`}>
                      {dest.difficulty}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-sunset/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-xl text-cream mb-1 group-hover:text-sunset transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-cream-muted text-sm leading-relaxed mb-4 line-clamp-2">
                    {dest.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-cream-muted">
                        <Clock className="w-3.5 h-3.5" />
                        {dest.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-cream-muted">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {dest.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-sunset font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Budget indicator */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-cream-muted">Est. budget / person</span>
                    <span className="text-sm font-medium text-gold">
                      ${dest.estimatedBudget.min}–${dest.estimatedBudget.max}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex justify-center mt-12"
        >
          <Link href="/destinations" className="btn-ghost flex items-center gap-2">
            View All Destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
