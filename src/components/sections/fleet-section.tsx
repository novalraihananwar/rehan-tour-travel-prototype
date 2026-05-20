'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function FleetSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl px-8 py-7"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-0">
            <div className="md:flex-1 md:pr-8 md:border-r md:border-white/8">
              <p className="text-xs text-sunset tracking-[0.25em] uppercase mb-2">30 Toyota HiAce</p>
              <h3 className="font-display text-display-md text-cream leading-tight" style={{ textWrap: 'balance' } as React.CSSProperties}>
                Your comfort, <span className="text-gradient-sunset">our standard</span>
              </h3>
              <p className="text-cream-muted text-sm mt-2 leading-relaxed max-w-sm">
                Every vehicle is maintained monthly. You&apos;ll receive your driver&apos;s WhatsApp before departure day.
              </p>
            </div>
            <div className="md:flex-1 md:pl-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Air conditioned', sub: 'All vehicles' },
                { label: 'GPS tracked', sub: 'Real-time' },
                { label: 'Fully insured', sub: 'Full coverage' },
                { label: 'Certified guides', sub: 'Bilingual' },
              ].map((f) => (
                <div key={f.label} className="text-center">
                  <div className="text-sm font-medium text-cream mb-0.5">{f.label}</div>
                  <div className="text-xs text-cream-muted">{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
