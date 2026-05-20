'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import { blogPosts } from '@/lib/data'
import { useLanguage } from '@/lib/i18n'

const categoryColors: Record<string, string> = {
  'East Java': 'bg-sunset/15 text-sunset border-sunset/25',
  'Hidden Gems': 'bg-gold/15 text-gold border-gold/25',
  'Volcano': 'bg-lava/15 text-red-300 border-red-400/25',
  'Tips': 'bg-jungle/15 text-jungle-light border-jungle/25',
  'Bali': 'bg-ocean/15 text-ocean-light border-ocean/25',
  'Culture': 'bg-white/8 text-cream-dark border-white/15',
}

const categoryMap: Record<string, string> = {
  'East Java Adventure': 'East Java',
  'Hidden Gems Indonesia': 'Hidden Gems',
  'Volcano Adventures': 'Volcano',
  'Backpacker Tips': 'Tips',
  'Bali Travel Guide': 'Bali',
  'Cultural Experiences': 'Culture',
}

const tags = ['All', 'East Java', 'Bali', 'Volcano', 'Hidden Gems', 'Tips', 'Culture']

export default function BlogPage() {
  const { t } = useLanguage()
  const [activeTag, setActiveTag] = useState('All')

  const filtered = blogPosts.filter(p => {
    if (activeTag === 'All') return true
    return categoryMap[p.category] === activeTag
  })

  const featured = filtered.find(p => p.featured) || filtered[0]
  const rest = filtered.filter(p => p.id !== featured?.id)

  return (
    <div className="min-h-screen bg-volcanic pt-20">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1920&q=60" alt="Blog" fill className="object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-volcanic/50 to-volcanic" />
        <div className="relative z-10 text-center px-4">
          <p className="text-xs text-sunset uppercase tracking-widest mb-3">{t.sections.blog}</p>
          <h1 className="font-display text-display-xl text-cream mb-3">
            Stories, Guides &<br /><span className="text-gradient-sunset">Hidden Gems</span>
          </h1>
          <p className="text-cream-muted max-w-xl mx-auto">Insider guides and real stories from years of guiding travelers across {t.nav.eastJava} and {t.nav.bali}.</p>
        </div>
      </div>

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tags — single row, short labels */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeTag === tag
                  ? 'bg-gradient-to-r from-sunset to-gold text-volcanic border-transparent'
                  : `border-white/10 text-cream-muted hover:border-white/25 hover:text-cream ${categoryColors[tag] ? categoryColors[tag] + ' opacity-70 hover:opacity-100' : ''}`
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <div className="destination-card grid grid-cols-1 md:grid-cols-2 overflow-hidden">
              <div className="relative h-72 md:h-auto overflow-hidden">
                <Image src={featured.coverImage} alt={featured.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border mb-4 ${categoryColors[categoryMap[featured.category]] || ''}`}>
                  {featured.category}
                </span>
                <h2 className="font-display text-2xl md:text-3xl text-cream group-hover:text-sunset transition-colors mb-3 leading-snug">{featured.title}</h2>
                <p className="text-cream-muted text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-cream-muted">
                    <Image src={featured.authorAvatar} alt={featured.author} width={28} height={28} className="rounded-full object-cover w-7 h-7" />
                    <span>{featured.author}</span>
                    <span>·</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featured.readTime}</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-sunset font-medium">
                    {t.general.readMore} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="destination-card block group">
              <div className="relative h-52 overflow-hidden">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic-200 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-sm ${categoryColors[categoryMap[post.category]] || ''}`}>{post.category}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-cream group-hover:text-sunset transition-colors mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs text-cream-muted mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-cream-muted">
                  <div className="flex items-center gap-2">
                    <Image src={post.authorAvatar} alt={post.author} width={20} height={20} className="rounded-full w-5 h-5 object-cover" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
