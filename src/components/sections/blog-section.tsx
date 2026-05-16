'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowRight, BookOpen } from 'lucide-react'
import { blogPosts } from '@/lib/data'

const categoryColors: Record<string, string> = {
  'East Java Adventure': 'bg-sunset/15 text-sunset border-sunset/25',
  'Hidden Gems Indonesia': 'bg-gold/15 text-gold border-gold/25',
  'Volcano Adventures': 'bg-lava/15 text-red-300 border-red-400/25',
  'Backpacker Tips': 'bg-jungle/15 text-jungle-light border-jungle/25',
  'Bali Travel Guide': 'bg-ocean/15 text-ocean-light border-ocean/25',
  'Cultural Experiences': 'bg-white/8 text-cream-dark border-white/15',
}

export function BlogSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const featured = blogPosts.filter(p => p.featured).slice(0, 3)

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="section-header"
        >
          <p className="section-eyebrow">Travel Journal</p>
          <h2 className="section-title">
            Practical Guides.<br />
            <span className="text-gradient-sunset">Real Experiences.</span>
          </h2>
          <p className="section-subtitle">
            Written by the guides who do this every week. Sunrise times, trail conditions, what to pack, where to eat — the insider knowledge most travel blogs don't have.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Featured post — large */}
          {featured[0] && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Link href={`/blog/${featured[0].slug}`} className="group block h-full">
                <div className="destination-card h-full flex flex-col">
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    <Image
                      src={featured[0].coverImage}
                      alt={featured[0].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-volcanic-200 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-sm ${categoryColors[featured[0].category] || 'bg-white/10 text-cream-dark border-white/20'}`}>
                        {featured[0].category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-cream-muted mb-3">
                      <Image src={featured[0].authorAvatar} alt={featured[0].author} width={24} height={24} className="rounded-full w-6 h-6 object-cover" />
                      <span>{featured[0].author}</span>
                      <span>·</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{featured[0].readTime}</span>
                    </div>
                    <h3 className="font-display text-xl text-cream group-hover:text-sunset transition-colors mb-3 leading-snug flex-1">
                      {featured[0].title}
                    </h3>
                    <p className="text-sm text-cream-muted leading-relaxed line-clamp-2 mb-4">
                      {featured[0].excerpt}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-sunset font-medium mt-auto">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Secondary posts */}
          <div className="flex flex-col gap-6">
            {featured.slice(1).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.15 }}
              >
                <Link href={`/blog/${post.slug}`} className="group flex gap-4 p-4 destination-card flex-row">
                  <div className="relative w-28 h-24 shrink-0 rounded-xl overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mb-2 ${categoryColors[post.category] || 'bg-white/8 text-cream-dark border-white/15'}`}>
                      {post.category}
                    </span>
                    <h3 className="font-medium text-sm text-cream group-hover:text-sunset transition-colors leading-snug line-clamp-2 mb-1.5">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-cream-muted">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
            >
              <Link href="/blog" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-white/10 hover:border-sunset/30 text-sm text-cream-muted hover:text-sunset transition-all duration-300">
                <BookOpen className="w-4 h-4" />
                All Articles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
