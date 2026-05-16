'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, MapPin, Star, Truck } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: 14800,
    suffix: '+',
    label: 'International Travelers',
    sub: 'Since 2018 — 38 nationalities served',
    color: 'sunset',
  },
  {
    icon: MapPin,
    value: 28,
    suffix: '',
    label: 'Active Destinations',
    sub: 'East Java + Bali — fully escorted',
    color: 'gold',
  },
  {
    icon: Star,
    value: 4.9,
    suffix: '/5',
    label: 'Average Rating',
    sub: 'Based on 3,200+ verified reviews',
    color: 'sunset',
    decimal: true,
  },
  {
    icon: Truck,
    value: 30,
    suffix: '',
    label: 'Toyota HiAce Fleet',
    sub: 'AC, GPS, certified drivers',
    color: 'ocean',
  },
]

function CountUp({ end, suffix, decimal }: { end: number; suffix: string; decimal?: boolean }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
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
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      <div className="absolute bottom-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6 text-center group hover:border-sunset/20 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  stat.color === 'sunset'
                    ? 'bg-sunset/15 text-sunset'
                    : stat.color === 'gold'
                    ? 'bg-gold/15 text-gold'
                    : 'bg-ocean/15 text-ocean-light'
                }`}
              >
                <stat.icon className="w-5 h-5" />
              </div>

              <div
                className={`font-display text-4xl lg:text-5xl font-bold mb-1 ${
                  stat.color === 'sunset'
                    ? 'text-gradient-sunset'
                    : stat.color === 'gold'
                    ? 'text-gold'
                    : 'text-ocean-light'
                }`}
              >
                {inView && <CountUp end={stat.value} suffix={stat.suffix} decimal={stat.decimal} />}
              </div>

              <p className="text-sm font-medium text-cream mb-1">{stat.label}</p>
              <p className="text-xs text-cream-muted leading-snug">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
