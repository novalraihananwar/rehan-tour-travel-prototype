import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://rehantour.id'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [packagesRes, destinationsRes, blogsRes] = await Promise.allSettled([
    supabase.from('packages').select('slug, updated_at').eq('is_active', true),
    supabase.from('destinations').select('slug, updated_at'),
    supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true),
  ])

  const packages = packagesRes.status === 'fulfilled' ? (packagesRes.value.data || []) : []
  const destinations = destinationsRes.status === 'fulfilled' ? (destinationsRes.value.data || []) : []
  const blogs = blogsRes.status === 'fulfilled' ? (blogsRes.value.data || []) : []

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/destinations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/booking`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const packagePages: MetadataRoute.Sitemap = packages.map(p => ({
    url: `${BASE}/packages/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const destinationPages: MetadataRoute.Sitemap = destinations.map(d => ({
    url: `${BASE}/destinations/${d.slug}`,
    lastModified: d.updated_at ? new Date(d.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const blogPages: MetadataRoute.Sitemap = blogs.map(b => ({
    url: `${BASE}/blog/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...packagePages, ...destinationPages, ...blogPages]
}
