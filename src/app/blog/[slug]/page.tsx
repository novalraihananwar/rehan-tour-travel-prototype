import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Clock, ArrowRight } from 'lucide-react'
import { blogPosts } from '@/lib/data'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = blogPosts.find((p) => p.slug === params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [{ url: post.coverImage }] },
  }
}

const categoryColors: Record<string, string> = {
  'East Java Adventure': 'bg-sunset/15 text-sunset border-sunset/25',
  'Hidden Gems Indonesia': 'bg-gold/15 text-gold border-gold/25',
  'Volcano Adventures': 'bg-lava/15 text-red-300 border-red-400/25',
  'Backpacker Tips': 'bg-jungle/15 text-jungle-light border-jungle/25',
  'Bali Travel Guide': 'bg-ocean/15 text-ocean-light border-ocean/25',
  'Cultural Experiences': 'bg-white/8 text-cream-dark border-white/15',
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((p) => p.slug === params.slug)
  if (!post) notFound()

  const related = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3)

  return (
    <div className="min-h-screen bg-volcanic pt-16">
      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-volcanic via-volcanic/30 to-transparent" />
        <div className="absolute bottom-10 max-w-3xl mx-auto px-4 left-0 right-0">
          <Link href="/blog" className="flex items-center gap-1.5 text-xs text-cream-muted mb-4 hover:text-cream transition-colors">
            <ChevronLeft className="w-4 h-4" /> All Articles
          </Link>
          <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border mb-4 ${categoryColors[post.category] || ''}`}>
            {post.category}
          </span>
          <h1 className="font-display text-display-md text-cream">{post.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Image src={post.authorAvatar} alt={post.author} width={36} height={36} className="rounded-full w-9 h-9 object-cover" />
            <div>
              <div className="text-sm font-medium text-cream">{post.author}</div>
              <div className="text-xs text-cream-muted">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cream-muted ml-auto">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </div>
        </div>

        {/* Article body */}
        <div className="prose-dark">
          <p className="text-cream-muted text-lg leading-relaxed mb-6">{post.excerpt}</p>

          <div className="glass-card rounded-2xl p-6 mb-6">
            <p className="text-sm text-cream-muted italic">
              Full article content would be rendered here in a production environment. This is a preview of our cinematic travel guide for <span className="text-cream font-medium">{post.title}</span>.
              Our comprehensive guides cover everything from logistics and safety to hidden gems and local food recommendations.
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/8">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs bg-volcanic-400 text-cream-muted border border-white/8 hover:border-sunset/20 hover:text-cream transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 p-6 glass-card rounded-2xl border-sunset/15">
          <h3 className="font-display text-xl text-cream mb-2">Ready to experience this yourself?</h3>
          <p className="text-cream-muted text-sm mb-4">Turn this article into your next adventure. We have packages that cover everything described here.</p>
          <Link href="/packages" className="btn-primary inline-flex items-center gap-2">
            Browse Packages <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="font-display text-xl text-cream mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="destination-card block group">
                  <div className="relative h-36 overflow-hidden">
                    <Image src={r.coverImage} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-volcanic-200 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-cream group-hover:text-sunset transition-colors line-clamp-2">{r.title}</h4>
                    <p className="text-xs text-cream-muted mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {r.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
