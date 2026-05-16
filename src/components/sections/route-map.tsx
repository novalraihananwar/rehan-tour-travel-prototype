'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Flame, Droplets, Anchor, MapPin, Clock, ChevronDown } from 'lucide-react'

interface RouteStop {
  id: string
  name: string
  type: 'city' | 'volcano' | 'waterfall' | 'ferry' | 'island'
  time: string
  elevation?: string
  note: string
  detail: string
  isFerry?: boolean
}

const stops: RouteStop[] = [
  {
    id: 'surabaya',
    name: 'Surabaya',
    type: 'city',
    time: '06:00',
    note: 'Departure',
    detail: 'Pickup from Juanda Airport, Gubeng Station, or your hotel. Morning departure by private HiAce.',
  },
  {
    id: 'malang',
    name: 'Malang',
    type: 'city',
    time: '09:00',
    note: 'Highland city',
    detail: 'Optional stop in Malang — colonial streets, Jodipan colourful village, Museum Angkut. 450m elevation, cool air.',
  },
  {
    id: 'tumpak-sewu',
    name: 'Tumpak Sewu',
    type: 'waterfall',
    time: '13:00',
    note: '120m waterfall',
    detail: "Java's most spectacular curtain waterfall. Guided canyon descent with fixed ropes. Walk directly behind the falls.",
  },
  {
    id: 'bromo',
    name: 'Mt. Bromo',
    type: 'volcano',
    time: '03:30',
    elevation: '2,329 m',
    note: 'Pre-dawn Jeep',
    detail: '4WD Jeep convoy to Penanjakan at 3:30am. Sunrise over the caldera at 5:30am. Crater rim walk across the volcanic sand sea.',
  },
  {
    id: 'banyuwangi',
    name: 'Banyuwangi',
    type: 'city',
    time: 'Evening',
    note: '9-hour drive',
    detail: 'Scenic cross-Java drive through coffee and rubber plantations. Arrive in Banyuwangi for dinner and rest before the midnight Ijen hike.',
  },
  {
    id: 'ijen',
    name: 'Ijen Crater',
    type: 'volcano',
    time: '00:00',
    elevation: '2,799 m',
    note: 'Blue fire',
    detail: "Midnight hike to witness the world's rarest natural phenomenon — liquid sulphur burning in electric blue. Crater lake sunrise at 5:30am.",
  },
  {
    id: 'ferry',
    name: 'Ferry Crossing',
    type: 'ferry',
    time: 'Dawn',
    note: '30 min · Bali Strait',
    detail: 'Board the Ketapang–Gilimanuk ferry across the Bali Strait. Watch Java recede and Bali appear through the morning mist.',
    isFerry: true,
  },
  {
    id: 'bali',
    name: 'Bali',
    type: 'island',
    time: 'Arrival',
    note: 'Paradise island',
    detail: 'Drop-off at your Bali hotel — Kuta, Seminyak, Ubud, Canggu, or anywhere on the island. Your East Java adventure is complete.',
  },
]

const typeConfig = {
  city:      { icon: MapPin, color: 'text-cream-dark',   ring: 'ring-cream-dark/40',   dot: 'bg-cream-dark',    bg: 'bg-volcanic-400',   label: 'City' },
  volcano:   { icon: Flame,  color: 'text-sunset',       ring: 'ring-sunset/40',       dot: 'bg-sunset',        bg: 'bg-sunset/15',      label: 'Volcano' },
  waterfall: { icon: Droplets, color: 'text-ocean-light', ring: 'ring-ocean-light/40', dot: 'bg-ocean-light',   bg: 'bg-ocean/15',       label: 'Waterfall' },
  ferry:     { icon: Anchor, color: 'text-gold',          ring: 'ring-gold/40',         dot: 'bg-gold',          bg: 'bg-gold/15',        label: 'Ferry' },
  island:    { icon: MapPin, color: 'text-jungle-light',  ring: 'ring-jungle-light/40', dot: 'bg-jungle-light',  bg: 'bg-jungle/15',      label: 'Island' },
}

// Distance labels between stops
const legLabels = ['130 km · 3h', '170 km · 3h', '90 km · 2.5h', '340 km · 9h', '42 km · 1.5h', '4 km · 30 min', '']

export function RouteMap() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activeStop, setActiveStop] = useState<string | null>(null)

  return (
    <section ref={ref} className="py-24 bg-volcanic-200/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient opacity-15" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="section-header"
        >
          <p className="section-eyebrow">Overland Route</p>
          <h2 className="section-title">
            920 km. Seven Stops.<br />
            <span className="text-gradient-sunset">One Seamless Journey.</span>
          </h2>
          <p className="section-subtitle">
            Surabaya to Bali by Toyota HiAce — across a volcanic caldera, down a waterfall canyon,
            through a coffee-belt night drive, and onto a ferry at dawn.
          </p>
        </motion.div>

        {/* ── Route Timeline ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass-card rounded-3xl p-6 md:p-10 mb-8 overflow-hidden"
        >
          {/* Dot-grid background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Scrollable stops row */}
          <div className="relative overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex items-start gap-0 min-w-max">
              {stops.map((stop, i) => {
                const cfg = typeConfig[stop.type]
                const isActive = activeStop === stop.id
                const isLast = i === stops.length - 1

                return (
                  <div key={stop.id} className="flex items-start">
                    {/* Stop column */}
                    <div className="flex flex-col items-center w-28 md:w-32">
                      {/* Time badge */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.4 + i * 0.12 }}
                        className="flex items-center gap-1 mb-3"
                      >
                        <Clock className="w-2.5 h-2.5 text-cream-muted" />
                        <span className="text-xs text-cream-muted font-mono">{stop.time}</span>
                      </motion.div>

                      {/* Circle marker */}
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={inView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 300 }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveStop(isActive ? null : stop.id)}
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ring-2 ${
                          isActive
                            ? `${cfg.bg} ${cfg.ring} shadow-lg`
                            : 'bg-volcanic-400 ring-white/10 hover:ring-2 hover:' + cfg.ring
                        }`}
                      >
                        <cfg.icon className={`w-5 h-5 ${isActive ? cfg.color : 'text-cream-muted'}`} />
                        {/* Pulse dot for active stops */}
                        {(stop.type === 'volcano' || stop.type === 'ferry') && (
                          <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${cfg.dot} border-2 border-volcanic-300`} />
                        )}
                      </motion.button>

                      {/* Name */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.6 + i * 0.12 }}
                        className={`mt-3 text-xs font-medium text-center leading-tight transition-colors ${isActive ? cfg.color : 'text-cream'}`}
                      >
                        {stop.name}
                      </motion.p>

                      {/* Note / elevation */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.7 + i * 0.12 }}
                        className="mt-0.5 text-xs text-cream-muted text-center leading-tight"
                      >
                        {stop.elevation || stop.note}
                      </motion.p>

                      {/* Expand indicator */}
                      {isActive && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                          <ChevronDown className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </motion.div>
                      )}
                    </div>

                    {/* Connecting line between stops */}
                    {!isLast && (
                      <div className="flex flex-col items-center pt-11 w-10 md:w-14 shrink-0">
                        <div className="relative w-full flex flex-col items-center">
                          {/* Animated line */}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={inView ? { scaleX: 1 } : {}}
                            transition={{ delay: 0.8 + i * 0.12, duration: 0.4 }}
                            style={{ transformOrigin: 'left center' }}
                            className={`h-px w-full ${
                              stops[i + 1].isFerry
                                ? 'border-t border-dashed border-gold'
                                : 'bg-gradient-to-r from-white/15 to-white/8'
                            }`}
                          />
                          {/* Distance label */}
                          {legLabels[i] && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={inView ? { opacity: 1 } : {}}
                              transition={{ delay: 1 + i * 0.12 }}
                              className="text-[9px] text-cream-muted/50 mt-1 text-center whitespace-nowrap hidden md:block"
                            >
                              {legLabels[i]}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail panel — appears below when a stop is active */}
          <div
            className={`overflow-hidden transition-all duration-500 ${
              activeStop ? 'max-h-40 mt-6' : 'max-h-0 mt-0'
            }`}
          >
            {activeStop && (() => {
              const stop = stops.find(s => s.id === activeStop)
              if (!stop) return null
              const cfg = typeConfig[stop.type]
              return (
                <motion.div
                  key={activeStop}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 border flex items-start gap-4 ${cfg.bg} border-current/10`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-volcanic-300/60`}>
                    <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${cfg.color}`}>{stop.name}</span>
                      <span className="text-xs text-cream-muted">·</span>
                      <span className="text-xs text-cream-muted">{stop.time}</span>
                      {stop.elevation && (
                        <>
                          <span className="text-xs text-cream-muted">·</span>
                          <span className="text-xs text-cream-muted">{stop.elevation}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-cream-muted leading-relaxed">{stop.detail}</p>
                  </div>
                </motion.div>
              )
            })()}
          </div>

          {!activeStop && (
            <p className="text-xs text-cream-muted/50 text-center mt-4">
              Tap any stop for details
            </p>
          )}
        </motion.div>

        {/* ── Stop card grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {stops.map((stop, i) => {
            const cfg = typeConfig[stop.type]
            const isActive = activeStop === stop.id
            return (
              <motion.button
                key={stop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                onClick={() => setActiveStop(isActive ? null : stop.id)}
                className={`glass-card rounded-xl p-3 text-center transition-all duration-300 cursor-pointer ${
                  isActive ? `border ${cfg.ring} ${cfg.bg}` : 'hover:border-white/15'
                }`}
              >
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  isActive ? cfg.bg : 'bg-volcanic-400'
                }`}>
                  <cfg.icon className={`w-4 h-4 ${isActive ? cfg.color : 'text-cream-muted'}`} />
                </div>
                <p className={`text-xs font-medium truncate ${isActive ? cfg.color : 'text-cream'}`}>
                  {stop.name}
                </p>
                <p className="text-xs text-cream-muted mt-0.5">{stop.time}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-white/6"
        >
          {Object.entries(typeConfig).map(([type, cfg]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${cfg.bg}`}>
                <cfg.icon className={`w-3 h-3 ${cfg.color}`} />
              </div>
              <span className="text-xs text-cream-muted">{cfg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-8 h-px border-t border-dashed border-gold" />
            <span className="text-xs text-cream-muted">Ferry crossing</span>
          </div>
        </motion.div>

        {/* Total stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.8 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-6 border-t border-white/6"
        >
          {[
            { label: 'Total distance', value: '≈ 920 km' },
            { label: 'Total duration', value: '6 days / 5 nights' },
            { label: 'Volcanoes', value: '2 active craters' },
            { label: 'Ferry crossing', value: 'Bali Strait · 30 min' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-lg text-gradient-sunset">{s.value}</div>
              <div className="text-xs text-cream-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
