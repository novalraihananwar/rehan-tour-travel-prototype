'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const stats = [
  {
    value: 14800,
    suffix: '+',
    label: 'International travelers',
    sub: 'Since 2018 — 38 nationalities served',
    decimal: false,
  },
  {
    value: 4.9,
    suffix: '/5',
    label: 'Average rating',
    sub: 'Based on 3,200+ verified reviews',
    decimal: true,
  },
  {
    value: 28,
    suffix: '',
    label: 'Active destinations',
    sub: 'East Java + Bali — fully escorted',
    decimal: false,
  },
  {
    value: 920,
    suffix: ' km',
    label: 'Overland route',
    sub: 'Surabaya to Bali — 6 days, one seamless journey',
    decimal: false,
  },
]

function CountUp({ end, suffix, decimal }: { end: number; suffix: string; decimal?: boolean }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = end / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(decimal ? parseFloat(current.toFixed(1)) : Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, end, decimal])

  return (
    <span ref={ref}>
      {decimal ? count.toFixed(1) : count.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient opacity-25" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Asymmetric bento — grid-flow-dense ensures no empty cells */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-auto"
          style={{ gridAutoFlow: 'dense' }}
        >
          {/* Large hero stat — col+row span 2×2 on md */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="col-span-2 md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group"
            style={{ minHeight: '280px' }}
          >
            <Image
              src="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=900&q=80"
              alt="Mount Bromo sunrise"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-volcanic via-volcanic/60 to-volcanic/10" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="font-display text-5xl md:text-7xl font-bold text-gradient-sunset mb-2 tabular-nums">
                {inView && <CountUp end={stats[0].value} suffix={stats[0].suffix} />}
              </div>
              <p className="text-cream text-lg font-medium mb-1">{stats[0].label}</p>
              <p className="text-cream-muted text-sm">{stats[0].sub}</p>
            </div>
          </motion.div>

          {/* Stat card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between group hover:border-sunset/20 transition-all duration-300"
          >
            <div className="font-display text-4xl md:text-5xl font-bold text-gradient-sunset tabular-nums mb-3">
              {inView && <CountUp end={stats[1].value} suffix={stats[1].suffix} decimal={stats[1].decimal} />}
            </div>
            <div>
              <p className="text-cream text-sm font-medium mb-1">{stats[1].label}</p>
              <p className="text-cream-muted text-xs leading-snug">{stats[1].sub}</p>
            </div>
          </motion.div>

          {/* Stat card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between group hover:border-gold/20 transition-all duration-300"
          >
            <div className="font-display text-4xl md:text-5xl font-bold text-gold tabular-nums mb-3">
              {inView && <CountUp end={stats[2].value} suffix={stats[2].suffix} />}
            </div>
            <div>
              <p className="text-cream text-sm font-medium mb-1">{stats[2].label}</p>
              <p className="text-cream-muted text-xs leading-snug">{stats[2].sub}</p>
            </div>
          </motion.div>

          {/* Stat card 4 — full width on mobile, single col on md */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="col-span-2 md:col-span-1 glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between group hover:border-sunset/20 transition-all duration-300"
          >
            <div className="font-display text-4xl md:text-5xl font-bold text-gradient-sunset tabular-nums mb-3">
              {inView && <CountUp end={stats[3].value} suffix={stats[3].suffix} />}
            </div>
            <div>
              <p className="text-cream text-sm font-medium mb-1">{stats[3].label}</p>
              <p className="text-cream-muted text-xs leading-snug">{stats[3].sub}</p>
            </div>
          </motion.div>
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 glass-card rounded-2xl px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { label: 'Air conditioned', sub: 'All 30 vehicles' },
            { label: 'GPS tracked', sub: 'Real-time location' },
            { label: 'Fully insured', sub: 'Comprehensive coverage' },
            { label: 'Certified guides', sub: 'Bilingual, trained' },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-sm font-medium text-cream mb-0.5">{f.label}</div>
              <div className="text-xs text-cream-muted">{f.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
