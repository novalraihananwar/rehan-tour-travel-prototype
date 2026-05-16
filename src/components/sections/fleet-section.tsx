'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { Truck, Users, CheckCircle, AlertCircle, Clock, Wrench } from 'lucide-react'
import { fleetVehicles } from '@/lib/data'

const statusConfig: Record<string, { color: string; bg: string; dot: string; icon: React.ElementType }> = {
  Available: { color: 'text-jungle-light', bg: 'bg-jungle/15', dot: 'bg-jungle-light', icon: CheckCircle },
  Standby: { color: 'text-gold', bg: 'bg-gold/15', dot: 'bg-gold', icon: Clock },
  'Fully Booked': { color: 'text-lava', bg: 'bg-lava/15', dot: 'bg-lava', icon: AlertCircle },
  'On Trip': { color: 'text-sunset', bg: 'bg-sunset/15', dot: 'bg-sunset', icon: Truck },
  Maintenance: { color: 'text-cream-muted', bg: 'bg-white/8', dot: 'bg-cream-muted', icon: Wrench },
}

export function FleetSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const statusCount = fleetVehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="section-header"
        >
          <p className="section-eyebrow">Our Fleet</p>
          <h2 className="section-title">
            30 Toyota HiAce —<br />
            <span className="text-gradient-sunset">Your Comfort, Our Standard</span>
          </h2>
          <p className="section-subtitle">
            Air-conditioned, GPS-tracked, and assigned a certified guide-driver. Every vehicle in our fleet is maintained on a monthly schedule. You'll know your vehicle ID and driver's WhatsApp before departure day.
          </p>
        </motion.div>

        {/* Fleet status overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12"
        >
          {Object.entries(statusConfig).map(([status, cfg]) => (
            <div key={status} className="glass-card rounded-2xl p-4 text-center">
              <div className={`w-2 h-2 rounded-full ${cfg.dot} mx-auto mb-2`} />
              <div className={`text-2xl font-bold font-display ${cfg.color}`}>
                {statusCount[status] || 0}
              </div>
              <div className="text-xs text-cream-muted mt-1">{status}</div>
            </div>
          ))}
        </motion.div>

        {/* Vehicle cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetVehicles.map((vehicle, i) => {
            const cfg = statusConfig[vehicle.status]
            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                className="glass-card rounded-2xl overflow-hidden group hover:border-sunset/20 transition-all duration-300"
              >
                {/* Vehicle image */}
                <div className="relative h-36 overflow-hidden bg-volcanic-400">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Truck className="w-16 h-16 text-volcanic-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic-300 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm border ${cfg.bg} ${cfg.color} border-current/20`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                      {vehicle.status}
                    </span>
                  </div>

                  {/* ID badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-mono text-cream-muted bg-volcanic/70 backdrop-blur-sm px-2 py-1 rounded">
                      {vehicle.id}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-xs text-cream-muted mb-1 font-mono">{vehicle.plateNumber}</div>
                  <h3 className="text-sm font-medium text-cream mb-3 leading-snug">{vehicle.model}</h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-cream-muted">Driver</span>
                      <span className="text-cream-dark">{vehicle.driver}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cream-muted">Capacity</span>
                      <span className="text-cream-dark">{vehicle.capacity} pax</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cream-muted">Total trips</span>
                      <span className="text-sunset font-medium">{vehicle.totalTrips}</span>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  {vehicle.status === 'On Trip' && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-cream-muted">Occupancy</span>
                        <span className="text-sunset">{vehicle.occupancy}/{vehicle.capacity}</span>
                      </div>
                      <div className="w-full bg-volcanic-500 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-sunset to-gold"
                          style={{ width: `${(vehicle.occupancy / vehicle.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {vehicle.currentRoute && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-cream-muted flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sunset animate-pulse" />
                        {vehicle.currentRoute}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Fleet features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 glass-card rounded-2xl p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '❄️', label: 'Air Conditioned', sub: 'All vehicles' },
              { icon: '📍', label: 'GPS Tracked', sub: 'Real-time location' },
              { icon: '🔒', label: 'Insured', sub: 'Full coverage' },
              { icon: '👤', label: 'Expert Drivers', sub: 'Certified guides' },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-sm font-medium text-cream">{f.label}</div>
                <div className="text-xs text-cream-muted mt-0.5">{f.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
