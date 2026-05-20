'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, Star, ArrowRight, Filter } from 'lucide-react'
import { tourPackages } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'

const types = ['All', 'Shared', 'Private', 'Luxury', 'Honeymoon']
const durations = ['All', '1–2 Days', '3–4 Days', '5+ Days']
const sortOptions = ['Featured', 'Price Low-High', 'Price High-Low', 'Rating', 'Duration']

export function PackagesPageClient() {
  const { t, formatPrice } = useLanguage()
  const [type, setType] = useState('All')
  const [duration, setDuration] = useState('All')
  const [sort, setSort] = useState('Featured')

  let filtered = tourPackages.filter((p) => {
    const matchType = type === 'All' || p.type.toLowerCase() === type.toLowerCase()
    const matchDuration =
      duration === 'All' ||
      (duration === '1–2 Days' && p.durationDays <= 2) ||
      (duration === '3–4 Days' && p.durationDays >= 3 && p.durationDays <= 4) ||
      (duration === '5+ Days' && p.durationDays >= 5)
    return matchType && matchDuration
  })

  if (sort === 'Price Low-High') filtered = [...filtered].sort((a, b) => a.price.usd - b.price.usd)
  if (sort === 'Price High-Low') filtered = [...filtered].sort((a, b) => b.price.usd - a.price.usd)
  if (sort === 'Rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  if (sort === 'Duration') filtered = [...filtered].sort((a, b) => a.durationDays - b.durationDays)

  return (
    <div className="min-h-screen bg-volcanic pt-20">
      {/* Hero banner */}
      <div className="relative py-20 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=70" alt="Packages" fill className="object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-volcanic/60 to-volcanic" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-sunset uppercase tracking-widest mb-3">Tour Packages</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-display-xl text-cream mb-3">
            Choose Your<br /><span className="text-gradient-sunset">Adventure</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-cream-muted">
            {tourPackages.length} curated packages · Shared groups, private tours & luxury escapes
          </motion.p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-20 z-40 py-4 glass border-b border-white/5">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 mr-4">
              <Filter className="w-4 h-4 text-cream-muted" />
              <span className="text-sm text-cream-muted">Filter:</span>
            </div>

            {/* Type filter */}
            <div className="flex gap-2">
              {types.map((t) => (
                <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${type === t ? 'bg-sunset/20 text-sunset border border-sunset/30' : 'text-cream-muted border border-white/10 hover:border-sunset/20'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* Duration */}
            <div className="flex gap-2">
              {durations.map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${duration === d ? 'bg-gold/20 text-gold border border-gold/30' : 'text-cream-muted border border-white/10 hover:border-gold/20'}`}>
                  {d}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs bg-volcanic-300 text-cream border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-sunset/40"
              >
                {sortOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Packages grid */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-cream-muted mb-8">
          <span className="text-cream font-medium">{filtered.length}</span> packages found
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={`/packages/${pkg.slug}`} className="package-card block group h-full">
                <div className="relative h-52 overflow-hidden">
                  <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic-300 via-volcanic-300/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {pkg.tags.slice(0, 2).map((tag) => <span key={tag} className="tag-badge text-xs backdrop-blur-sm">{tag}</span>)}
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-volcanic/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    <span className="text-xs text-cream">{pkg.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-cream group-hover:text-sunset transition-colors mb-1">{pkg.title}</h3>
                  <p className="text-xs text-cream-muted mb-4 line-clamp-2">{pkg.subtitle}</p>
                  <div className="flex items-center gap-4 text-xs text-cream-muted mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {pkg.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Max {pkg.maxGroupSize}</span>
                    <span className={`flex items-center gap-1.5 ${pkg.availableSeats <= 4 ? 'text-lava' : 'text-jungle-light'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${pkg.availableSeats <= 4 ? 'bg-lava' : 'bg-jungle-light'}`} />
                      {pkg.availableSeats} {t.general.seatsLeft}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <span className="text-2xl font-bold text-gradient-sunset font-display">{formatPrice(pkg.price.usd)}</span>
                      <span className="text-xs text-cream-muted ml-1">{t.general.perPerson}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-cream-muted hover:text-sunset transition-colors">
                      {t.general.viewDetails} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
