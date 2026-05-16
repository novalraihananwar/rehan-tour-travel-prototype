'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Users, ArrowRight, Zap } from 'lucide-react'
import { departureSchedule } from '@/lib/data'

function useCountdown(targetDate: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return time
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass-card rounded-xl w-14 h-14 flex items-center justify-center mb-1 relative overflow-hidden">
        <span className="font-display text-xl font-bold text-sunset z-10">
          {String(value).padStart(2, '0')}
        </span>
        <div className="absolute inset-0 bg-sunset/5" />
      </div>
      <span className="text-xs text-cream-muted uppercase tracking-wider">{label}</span>
    </div>
  )
}

function DepartureCard({ dep, index }: { dep: typeof departureSchedule[0]; index: number }) {
  const countdown = useCountdown(dep.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-2xl p-5 hover:border-sunset/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-medium text-cream text-sm">{dep.package}</p>
          <p className="text-xs text-cream-muted mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {new Date(dep.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
          dep.status === 'Limited'
            ? 'bg-lava/15 text-lava border-lava/25'
            : 'bg-jungle/15 text-jungle-light border-jungle/25'
        }`}>
          {dep.status}
        </span>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-2 mb-4">
        <CountdownUnit value={countdown.days} label="Days" />
        <span className="text-cream-muted font-bold mb-4">:</span>
        <CountdownUnit value={countdown.hours} label="Hrs" />
        <span className="text-cream-muted font-bold mb-4">:</span>
        <CountdownUnit value={countdown.minutes} label="Min" />
        <span className="text-cream-muted font-bold mb-4">:</span>
        <CountdownUnit value={countdown.seconds} label="Sec" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="w-3.5 h-3.5 text-cream-muted" />
          <span className={dep.seats <= 4 ? 'text-lava font-medium' : 'text-cream-muted'}>
            {dep.seats} seats remaining
          </span>
        </div>
        <Link
          href="/booking"
          className="flex items-center gap-1 text-xs font-medium text-sunset hover:text-gold transition-colors"
        >
          Book now <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}

export function CountdownSection() {
  return (
    <section className="py-24 bg-volcanic-200/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient opacity-15" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-sunset" />
              <span className="text-xs font-medium text-sunset uppercase tracking-widest">Live Departures</span>
            </div>
            <h2 className="font-display text-display-md text-cream">
              Upcoming <span className="text-gradient-sunset">Departures</span>
            </h2>
            <p className="text-sm text-cream-muted mt-1">Seats fill fast — lock in your spot today</p>
          </div>
          <Link href="/packages" className="btn-ghost text-sm hidden md:flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departureSchedule.slice(0, 3).map((dep, i) => (
            <DepartureCard key={dep.date} dep={dep} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
