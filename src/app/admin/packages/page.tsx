'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, Star, Edit3, Eye, Plus, ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react'
import { tourPackages } from '@/lib/data'

const packageStats: Record<string, { bookings: number; revenue: number; occupancyRate: number }> = {
  'bromo-sunrise-tour': { bookings: 312, revenue: 24648, occupancyRate: 88 },
  'bromo-ijen-expedition': { bookings: 187, revenue: 36465, occupancyRate: 76 },
  'surabaya-bali-overland': { bookings: 143, revenue: 49335, occupancyRate: 82 },
  'tumpak-sewu-adventure': { bookings: 94, revenue: 6110, occupancyRate: 71 },
  'malang-hidden-gems': { bookings: 212, revenue: 10388, occupancyRate: 90 },
  'bali-tropical-escape': { bookings: 98, revenue: 28322, occupancyRate: 78 },
  'luxury-east-java-escape': { bookings: 31, revenue: 20150, occupancyRate: 62 },
  'honeymoon-tropical-bali': { bookings: 44, revenue: 37180, occupancyRate: 95 },
}

export default function PackagesPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [statusToggles, setStatusToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(tourPackages.map((p) => [p.id, true]))
  )

  const types = ['All', 'Shared', 'Private', 'Luxury', 'Honeymoon']

  const filtered = tourPackages.filter((p) =>
    activeFilter === 'All' || p.type.toLowerCase() === activeFilter.toLowerCase()
  )

  const totalRevenue = Object.values(packageStats).reduce((sum, s) => sum + s.revenue, 0)
  const totalBookings = Object.values(packageStats).reduce((sum, s) => sum + s.bookings, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Packages</h1>
          <p className="text-sm text-cream-muted mt-0.5">{tourPackages.length} active packages · ${totalRevenue.toLocaleString('en-US')} total revenue</p>
        </div>
        <Link
          href="/packages"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-volcanic bg-sunset-gradient hover:shadow-glow-sunset transition-all"
        >
          <Plus className="w-4 h-4" /> New Package
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Packages', value: tourPackages.length },
          { label: 'Total Bookings', value: totalBookings.toLocaleString('en-US') },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en-US')}` },
          { label: 'Avg Occupancy', value: '80%' },
        ].map((c) => (
          <div key={c.label} className="glass-card rounded-2xl p-4">
            <div className="font-display text-2xl text-cream font-bold">{c.value}</div>
            <div className="text-xs text-cream-muted mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActiveFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${activeFilter === t ? 'bg-sunset/20 text-sunset border-sunset/30' : 'text-cream-muted border-white/10 hover:border-sunset/20'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Package cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((pkg, i) => {
          const stats = packageStats[pkg.slug] || { bookings: 0, revenue: 0, occupancyRate: 0 }
          const isActive = statusToggles[pkg.id] ?? true

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${!isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" />
                  {!isActive && (
                    <div className="absolute inset-0 bg-volcanic/70 flex items-center justify-center">
                      <span className="text-xs text-cream-muted font-medium">Hidden</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-cream line-clamp-1">{pkg.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-cream-muted">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pkg.duration}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max {pkg.maxGroupSize}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> {pkg.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-display text-lg font-bold text-gradient-sunset">${pkg.price.usd}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center p-2 bg-volcanic-400/50 rounded-lg">
                      <div className="text-sm font-bold text-cream">{stats.bookings}</div>
                      <div className="text-xs text-cream-muted">Bookings</div>
                    </div>
                    <div className="text-center p-2 bg-volcanic-400/50 rounded-lg">
                      <div className="text-sm font-bold text-gold">${(stats.revenue / 1000).toFixed(1)}k</div>
                      <div className="text-xs text-cream-muted">Revenue</div>
                    </div>
                    <div className="text-center p-2 bg-volcanic-400/50 rounded-lg">
                      <div className="text-sm font-bold text-sunset">{stats.occupancyRate}%</div>
                      <div className="text-xs text-cream-muted">Fill Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-volcanic-400/20">
                <div className="flex items-center gap-1 text-xs">
                  <div className={`w-2 h-2 rounded-full ${pkg.availableSeats <= 4 ? 'bg-lava' : pkg.availableSeats <= 8 ? 'bg-gold' : 'bg-jungle-light'}`} />
                  <span className="text-cream-muted">{pkg.availableSeats}/{pkg.totalSeats} seats · Next: {pkg.nextDeparture}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/packages/${pkg.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-white/8 text-cream-muted hover:text-cream transition-colors" title="View live page">
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button className="p-1.5 rounded-lg hover:bg-white/8 text-cream-muted hover:text-cream transition-colors" title="Edit">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setStatusToggles(prev => ({ ...prev, [pkg.id]: !prev[pkg.id] }))}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${isActive ? 'text-jungle-light bg-jungle/10 border-jungle/25' : 'text-cream-muted bg-white/5 border-white/10'}`}
                    title="Toggle visibility"
                  >
                    {isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    {isActive ? 'Live' : 'Hidden'}
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
