'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { testimonials } from '@/lib/data'

export function TestimonialsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const prev = () => {
    setDirection(-1)
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  }

  const next = () => {
    setDirection(1)
    setCurrent((c) => (c + 1) % testimonials.length)
  }

  const t = testimonials[current]

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sunset/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="section-header"
        >
          <p className="section-eyebrow">Verified Reviews</p>
          <h2 className="section-title">
            38 Nationalities.<br />
            <span className="text-gradient-sunset">One Common Word: Extraordinary.</span>
          </h2>
          <p className="section-subtitle">
            Real reviews from real bookings — Japan, Germany, Australia, Korea, the Netherlands. What they say in their own words.
          </p>
        </motion.div>

        {/* Featured testimonial */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            {/* Decorative quote */}
            <Quote className="absolute top-6 right-8 w-16 h-16 text-sunset/10" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                {/* Avatar & info */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left shrink-0 w-full md:w-48">
                  <div className="relative w-20 h-20 mb-4">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover rounded-2xl"
                    />
                    {t.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-jungle rounded-full flex items-center justify-center border-2 border-volcanic-300">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="font-medium text-cream">{t.name}</div>
                  <div className="text-sm text-cream-muted flex items-center gap-1 mt-0.5">
                    <span>{t.flag}</span> {t.country}
                  </div>
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array(5).fill(null).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-gold fill-gold' : 'text-volcanic-500'}`} />
                    ))}
                  </div>
                  <div className="mt-3 text-xs px-3 py-1 rounded-full bg-sunset/12 border border-sunset/25 text-sunset">
                    {t.package}
                  </div>
                </div>

                {/* Review text */}
                <div className="flex-1">
                  <p className="font-display text-xl md:text-2xl text-cream leading-relaxed mb-4 italic">
                    &ldquo;{t.review}&rdquo;
                  </p>
                  <p className="text-sm text-cream-muted">
                    {new Date(t.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    {t.verified && (
                      <span className="ml-3 text-jungle-light">
                        ✓ Verified booking
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/6">
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                    className={`transition-all duration-300 rounded-full ${
                      i === current ? 'w-6 h-2 bg-sunset' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-white/10 hover:border-sunset/30 flex items-center justify-center text-cream-muted hover:text-sunset transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-white/10 hover:border-sunset/30 flex items-center justify-center text-cream-muted hover:text-sunset transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Small testimonial cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          {testimonials.slice(0, 3).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover w-9 h-9"
                />
                <div>
                  <div className="text-sm font-medium text-cream">{t.name}</div>
                  <div className="text-xs text-cream-muted">{t.flag} {t.country}</div>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array(t.rating).fill(null).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-gold fill-gold" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-cream-muted line-clamp-3 leading-relaxed">&ldquo;{t.review}&rdquo;</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
