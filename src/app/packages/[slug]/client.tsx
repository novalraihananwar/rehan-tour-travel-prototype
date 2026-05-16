'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock, Users, Star, ArrowRight, ChevronLeft, CheckCircle2, XCircle,
  MapPin, ChevronDown, ChevronUp, Calendar, Truck
} from 'lucide-react'
import type { TourPackage } from '@/lib/data'
import { Glow } from '@/components/ui/glow'
import { Badge } from '@/components/ui/badge'
import { BookingCalendar } from '@/components/ui/calendar'
import { useLanguage } from '@/lib/i18n'

interface Props { tourPackage: TourPackage }

export function PackageDetailClient({ tourPackage: pkg }: Props) {
  const { t, formatPrice, formatPriceCompact } = useLanguage()
  const [openDay, setOpenDay] = useState<number | null>(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [guests, setGuests] = useState(2)

  const departureHighlights = [pkg.nextDeparture]

  return (
    <div className="min-h-screen bg-volcanic pt-16">
      {/* Hero */}
      <div className="relative h-[55vh] overflow-hidden">
        <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-volcanic via-volcanic/20 to-transparent" />
        <Glow variant="bottom" color="sunset" />

        <div className="absolute bottom-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 left-0 right-0">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Link href="/packages" className="flex items-center gap-1.5 text-xs text-cream-muted mb-4">
              <ChevronLeft className="w-4 h-4" /> All Packages
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              {pkg.tags.map((tag) => <Badge key={tag} variant="sunset">{tag}</Badge>)}
            </div>
            <h1 className="font-display text-display-lg text-cream mb-2">{pkg.title}</h1>
            <p className="text-cream-muted text-lg italic font-display">{pkg.subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Duration', value: pkg.duration, icon: Clock },
                { label: 'Group Size', value: `Max ${pkg.maxGroupSize}`, icon: Users },
                { label: 'Rating', value: `${pkg.rating}/5 (${pkg.reviewCount})`, icon: Star },
                { label: 'Distance', value: pkg.distance, icon: MapPin },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                  <s.icon className="w-4 h-4 text-sunset mx-auto mb-2" />
                  <div className="text-xs text-cream-muted mb-1">{s.label}</div>
                  <div className="text-sm font-medium text-cream">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Route */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-sunset" />
                <h3 className="font-medium text-cream">Route</h3>
              </div>
              <p className="text-sm text-cream-muted">{pkg.routeDescription}</p>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="font-display text-xl text-cream mb-4">Trip Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <Star className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span className="text-sm text-cream">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Included / Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-display text-xl text-cream mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-jungle-light" /> What's Included
                </h2>
                <div className="space-y-2">
                  {pkg.included.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-jungle-light shrink-0 mt-0.5" />
                      <span className="text-cream">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-display text-xl text-cream mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-cream-muted" /> Not Included
                </h2>
                <div className="space-y-2">
                  {pkg.excluded.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-sm">
                      <XCircle className="w-4 h-4 text-cream-muted shrink-0 mt-0.5" />
                      <span className="text-cream-muted">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div>
              <h2 className="font-display text-xl text-cream mb-6">Day-by-Day Itinerary</h2>
              <div className="space-y-3">
                {pkg.itinerary.map((day) => (
                  <div key={day.day} className="glass-card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sunset/15 border border-sunset/25 flex items-center justify-center text-sunset font-bold font-display">
                          {day.day}
                        </div>
                        <div>
                          <p className="font-medium text-cream text-sm">{day.title}</p>
                          <p className="text-xs text-cream-muted mt-0.5">{day.activities.slice(0, 2).join(' · ')}</p>
                        </div>
                      </div>
                      {openDay === day.day ? <ChevronUp className="w-4 h-4 text-cream-muted" /> : <ChevronDown className="w-4 h-4 text-cream-muted" />}
                    </button>
                    {openDay === day.day && (
                      <div className="px-5 pb-5 border-t border-white/5">
                        <p className="text-sm text-cream-muted mt-4 mb-4">{day.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-cream-muted uppercase tracking-wider mb-2">Activities</p>
                            {day.activities.map((a) => (
                              <div key={a} className="flex items-center gap-2 text-sm text-cream py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-sunset" />
                                {a}
                              </div>
                            ))}
                          </div>
                          {day.meals.length > 0 && (
                            <div>
                              <p className="text-xs text-cream-muted uppercase tracking-wider mb-2">Meals</p>
                              {day.meals.map((m) => (
                                <div key={m} className="flex items-center gap-2 text-sm text-cream py-1">
                                  🍽️ {m}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {day.accommodation && (
                          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-cream-muted">
                            🏨 {day.accommodation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <div className="flex items-baseline gap-2 mb-1">
                {pkg.originalPrice && (
                  <span className="text-sm text-cream-muted line-through">{formatPrice(pkg.originalPrice.usd)}</span>
                )}
                <span className="font-display text-4xl text-gradient-sunset font-bold">{formatPrice(pkg.price.usd)}</span>
                <span className="text-sm text-cream-muted">{t.packageDetail.perPerson}</span>
              </div>
              <p className="text-xs text-cream-muted mb-5">IDR {pkg.price.idr.toLocaleString('id-ID')}</p>

              {/* Calendar */}
              <BookingCalendar
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                highlightedDates={[pkg.nextDeparture]}
                className="mb-4"
              />

              {/* Guests */}
              <div className="mb-5">
                <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">Travelers</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-cream hover:border-sunset/30 transition-colors">−</button>
                  <span className="text-lg font-bold text-cream w-8 text-center">{guests}</span>
                  <button onClick={() => setGuests(Math.min(pkg.maxGroupSize, guests + 1))} className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-cream hover:border-sunset/30 transition-colors">+</button>
                  <span className="text-xs text-cream-muted ml-1">Max {pkg.maxGroupSize}</span>
                </div>
              </div>

              {/* Total */}
              <div className="p-3 bg-volcanic-400/50 rounded-xl mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-cream-muted">{formatPrice(pkg.price.usd)} × {guests}</span>
                  <span className="text-cream font-medium">{formatPrice(pkg.price.usd * guests)}</span>
                </div>
              </div>

              <Link
                href={`/booking?package=${pkg.slug}&guests=${guests}${selectedDate ? `&date=${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}` : ''}`}
                className="btn-primary w-full justify-center py-3.5"
              >
                Book This Package <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-4 flex items-center gap-2 text-xs text-cream-muted text-center justify-center">
                <span>{t.booking.freeCancel}</span>
              </div>

              {/* Availability indicator */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-cream-muted">{pkg.availableSeats} / {pkg.totalSeats} {t.packageDetail.seatsRemaining}</span>
                <div className="w-24 bg-volcanic-500 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-sunset to-gold" style={{ width: `${(pkg.availableSeats / pkg.totalSeats) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
