'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, MapPin, Clock, ArrowRight, TrendingUp } from 'lucide-react'
import { destinations } from '@/lib/data'
import { Spotlight } from '@/components/ui/spotlight'

const regions = ['All', 'East Java', 'Bali'] as const
const categories = ['All', 'Volcano', 'Waterfall', 'City', 'Temple', 'Beach', 'Island', 'Culture']

export function DestinationsPageClient() {
  const [region, setRegion] = useState<string>('All')
  const [category, setCategory] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filtered = destinations.filter((d) => {
    const matchRegion = region === 'All' || (region === 'East Java' ? d.region === 'east-java' : d.region === 'bali')
    const matchCat = category === 'All' || d.category.includes(category)
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase())
    return matchRegion && matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-volcanic pt-20">
      {/* Hero */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=70" alt="Destinations" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-volcanic/60 to-volcanic" />
        </div>
        <Spotlight className="-top-40 left-1/2 -translate-x-1/2" fill="#E8703A" />

        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-sunset uppercase tracking-widest mb-4">
            Explore
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-display-xl text-cream mb-4">
            East Java & Bali<br /><span className="text-gradient-sunset">Destinations</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-cream-muted text-lg max-w-xl mx-auto">
            {destinations.length} extraordinary destinations across two of Indonesia's most iconic regions.
          </motion.p>
        </div>
      </div>

      {/* Filters — unified sticky bar */}
      <div className="sticky top-20 z-40 py-3 glass border-b border-white/5">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative sm:w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="input-dark pl-9 text-sm py-2 w-full"
            />
          </div>

          {/* Unified filter pills — region + divider + category */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  region === r
                    ? 'bg-gradient-to-r from-sunset to-gold text-volcanic'
                    : 'text-cream-muted border border-white/10 hover:border-white/25 hover:text-cream'
                }`}
              >
                {r}
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-4 bg-white/15 mx-1 shrink-0" />

            {categories.slice(1).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? 'All' : c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  category === c
                    ? 'bg-sunset/20 text-sunset border border-sunset/30'
                    : 'text-cream-muted border border-white/8 hover:border-white/20 hover:text-cream'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-sm text-cream-muted mb-8">
          Showing <span className="text-cream font-medium">{filtered.length}</span> destinations
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/destinations/${dest.slug}`} className="destination-card block group">
                <div className="relative h-56 overflow-hidden">
                  <Image src={dest.image} alt={dest.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic-200 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border backdrop-blur-sm font-medium ${dest.region === 'east-java' ? 'bg-jungle/20 text-jungle-light border-jungle/30' : 'bg-ocean/20 text-ocean-light border-ocean/30'}`}>
                      {dest.region === 'east-java' ? '🌋 East Java' : '🏝️ Bali'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-cream group-hover:text-sunset transition-colors mb-1">{dest.name}</h3>
                  <p className="text-xs text-cream-muted mb-3 line-clamp-2">{dest.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-cream-muted">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dest.duration}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {dest.difficulty}</span>
                    </div>
                    <span className="text-gold font-medium">${dest.estimatedBudget.min}–${dest.estimatedBudget.max}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-cream-muted">No destinations found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
