'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Thermometer, Sun, Wallet, ArrowRight, ChevronLeft, Star, Mountain, Droplets, Utensils, Camera } from 'lucide-react'
import type { Destination } from '@/lib/data'
import { tourPackages } from '@/lib/data'
import { Glow } from '@/components/ui/glow'

interface Props { destination: Destination }

export function DestinationDetailClient({ destination: d }: Props) {
  const relatedPackages = tourPackages.filter(p =>
    p.routeDescription.toLowerCase().includes(d.name.toLowerCase().split(' ')[0]) ||
    p.category.some(c => c.toLowerCase().includes(d.category.toLowerCase()))
  ).slice(0, 3)

  return (
    <div className="min-h-screen bg-volcanic pt-16">
      {/* Cinematic hero */}
      <div className="relative h-[60vh] md:h-[75vh] overflow-hidden">
        <Image src={d.heroImage} alt={d.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-volcanic via-volcanic/30 to-volcanic/10" />
        <Glow variant="bottom" color="sunset" />

        <div className="absolute bottom-12 left-0 right-0">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link href="/destinations" className="flex items-center gap-1.5 text-xs text-cream-muted hover:text-cream mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Destinations
              </Link>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs px-3 py-1 rounded-full border font-medium backdrop-blur-sm ${d.region === 'east-java' ? 'bg-jungle/20 text-jungle-light border-jungle/30' : 'bg-ocean/20 text-ocean-light border-ocean/30'}`}>
                  {d.region === 'east-java' ? '🌋 East Java' : '🏝️ Bali'}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-sunset/20 text-sunset border border-sunset/30">{d.category}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-cream-dark border border-white/15">{d.difficulty}</span>
              </div>

              <h1 className="font-display text-display-xl text-cream mb-3">{d.name}</h1>
              <p className="text-lg text-cream-muted italic font-display">&ldquo;{d.tagline}&rdquo;</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: Clock, label: 'Duration', value: d.duration },
                { icon: Sun, label: 'Best Season', value: d.bestSeason },
                { icon: Thermometer, label: 'Temperature', value: d.weather.temp },
                { icon: Wallet, label: 'Budget / Person', value: `$${d.estimatedBudget.min}–$${d.estimatedBudget.max}` },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-2xl p-4">
                  <item.icon className="w-4 h-4 text-sunset mb-2" />
                  <div className="text-xs text-cream-muted mb-1">{item.label}</div>
                  <div className="text-sm font-medium text-cream">{item.value}</div>
                </div>
              ))}
            </motion.div>

            {/* Description */}
            <div>
              <h2 className="font-display text-2xl text-cream mb-4">About {d.name}</h2>
              <p className="text-cream-muted leading-relaxed">{d.longDescription}</p>
            </div>

            {/* Highlights */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-gold" />
                <h2 className="font-display text-xl text-cream">Highlights</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {d.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-sunset shrink-0" />
                    <span className="text-sm text-cream">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden gems */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-gold" />
                <h2 className="font-display text-xl text-cream">Hidden Gems</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {d.hiddenGems.map((gem) => (
                  <div key={gem} className="flex items-center gap-3 p-3 glass-card rounded-xl border-gold/10 hover:border-gold/20 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
                    <span className="text-sm text-cream">{gem}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Local food */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-sunset" />
                <h2 className="font-display text-xl text-cream">Local Food & Drinks</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {d.localFood.map((food) => (
                  <span key={food} className="px-3 py-1.5 rounded-full text-sm bg-volcanic-400 text-cream-dark border border-white/8">
                    🍽️ {food}
                  </span>
                ))}
              </div>
            </div>

            {/* Nearby places */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-ocean-light" />
                <h2 className="font-display text-xl text-cream">Nearby Destinations</h2>
              </div>
              <div className="space-y-2">
                {d.nearbyPlaces.map((place) => (
                  <div key={place} className="flex items-center gap-3 text-sm text-cream-muted">
                    <div className="w-1 h-1 rounded-full bg-ocean-light" />
                    {place}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather card */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display text-lg text-cream mb-4 flex items-center gap-2">
                <Sun className="w-4 h-4 text-gold" /> Weather & Climate
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-cream-muted">Temperature</span>
                  <span className="text-cream">{d.weather.temp}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cream-muted">Condition</span>
                  <span className="text-cream">{d.weather.condition}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cream-muted">Humidity</span>
                  <span className="text-cream">{d.weather.humidity}</span>
                </div>
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-cream-muted">Best season: <span className="text-gold">{d.bestSeason}</span></p>
                </div>
              </div>
            </div>

            {/* Book CTA */}
            <div className="glass-card rounded-2xl p-5 border-sunset/15">
              <h3 className="font-display text-lg text-cream mb-2">Visit {d.name}</h3>
              <p className="text-xs text-cream-muted mb-4">From ${d.estimatedBudget.min} per person · {d.duration}</p>
              <Link href="/booking" className="btn-primary w-full justify-center text-sm py-3">
                Book This Destination <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/packages" className="btn-ghost w-full justify-center text-sm py-3 mt-2">
                See Packages
              </Link>
            </div>

            {/* Related packages */}
            {relatedPackages.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-cream mb-3">Related Packages</h3>
                <div className="space-y-3">
                  {relatedPackages.map((pkg) => (
                    <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="flex gap-3 group p-3 glass-card rounded-xl hover:border-sunset/20 transition-all">
                      <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0">
                        <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-cream group-hover:text-sunset transition-colors line-clamp-2">{pkg.title}</p>
                        <p className="text-xs text-sunset mt-1 font-medium">${pkg.price.usd}/person</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
