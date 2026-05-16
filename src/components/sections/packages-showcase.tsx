'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, Star, ArrowRight, Zap, Crown, Heart } from 'lucide-react'
import { tourPackages } from '@/lib/data'
import { Badge } from '@/components/ui/badge'

const typeIcon: Record<string, React.ReactNode> = {
  shared: <Users className="w-3.5 h-3.5" />,
  private: <Zap className="w-3.5 h-3.5" />,
  luxury: <Crown className="w-3.5 h-3.5" />,
  honeymoon: <Heart className="w-3.5 h-3.5" />,
}

const typeLabel: Record<string, string> = {
  shared: 'Shared Group',
  private: 'Private',
  luxury: 'Luxury',
  honeymoon: 'Honeymoon',
}

export function PackagesShowcase() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const featured = tourPackages.filter((p) => p.featured)

  return (
    <section ref={ref} className="py-24 bg-volcanic-200/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="section-header"
        >
          <p className="section-eyebrow">Tour Packages</p>
          <h2 className="section-title">
            Everything Arranged —<br />
            <span className="text-gradient-sunset">You Just Show Up</span>
          </h2>
          <p className="section-subtitle">
            Hotel pickup, entrance fees, jeeps, ferries, gas masks, guides — all inside the one price. Shared groups from $49. Private tours and luxury escapes available.
          </p>
        </motion.div>

        {/* Featured packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featured.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
              className="package-card group"
            >
              {/* Cover image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={pkg.coverImage}
                  alt={pkg.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic-300 via-volcanic-300/20 to-transparent" />

                {/* Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {pkg.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag-badge text-xs backdrop-blur-sm">{tag}</span>
                  ))}
                </div>

                {/* Type badge */}
                <div className="absolute top-3 right-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-sm
                    ${pkg.type === 'luxury' ? 'bg-gold/20 text-gold border-gold/30' :
                      pkg.type === 'honeymoon' ? 'bg-lava/20 text-red-300 border-red-400/30' :
                      pkg.type === 'private' ? 'bg-ocean/20 text-ocean-light border-ocean/30' :
                      'bg-volcanic/40 text-cream-dark border-white/15'}`}>
                    {typeIcon[pkg.type]} {typeLabel[pkg.type]}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-volcanic/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  <span className="text-xs text-cream font-medium">{pkg.rating}</span>
                  <span className="text-xs text-cream-muted">({pkg.reviewCount})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-lg text-cream group-hover:text-sunset transition-colors leading-tight flex-1 mr-3">
                    {pkg.title}
                  </h3>
                </div>

                <p className="text-xs text-cream-muted mb-4 leading-relaxed line-clamp-2">
                  {pkg.subtitle}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-cream-muted">
                    <Clock className="w-3.5 h-3.5" />
                    {pkg.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-cream-muted">
                    <Users className="w-3.5 h-3.5" />
                    Max {pkg.maxGroupSize} pax
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2 h-2 rounded-full ${pkg.availableSeats <= 4 ? 'bg-lava' : pkg.availableSeats <= 8 ? 'bg-gold' : 'bg-jungle-light'}`} />
                    <span className={`${pkg.availableSeats <= 4 ? 'text-lava' : 'text-cream-muted'}`}>
                      {pkg.availableSeats} seats left
                    </span>
                  </div>
                </div>

                {/* Route preview */}
                <div className="mb-4 px-3 py-2 bg-volcanic-400/50 rounded-xl">
                  <p className="text-xs text-cream-muted truncate">📍 {pkg.routeDescription}</p>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    {pkg.originalPrice && (
                      <span className="text-xs text-cream-muted line-through mr-2">
                        ${pkg.originalPrice.usd}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gradient-sunset font-display">
                        ${pkg.price.usd}
                      </span>
                      <span className="text-xs text-cream-muted">/person</span>
                    </div>
                  </div>

                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-volcanic bg-sunset-gradient transition-all duration-300 hover:shadow-glow-sunset hover:-translate-y-0.5"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* All packages CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14"
        >
          <Link href="/packages" className="btn-primary">
            Browse All Packages <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/booking" className="btn-ghost">
            Custom Itinerary Request
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
