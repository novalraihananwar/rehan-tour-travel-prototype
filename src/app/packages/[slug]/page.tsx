import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tourPackages } from '@/lib/data'
import { PackageDetailClient } from './client'

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return tourPackages.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const pkg = tourPackages.find((p) => p.slug === params.slug)
  if (!pkg) return {}
  return {
    title: pkg.title,
    description: pkg.subtitle,
    openGraph: { images: [{ url: pkg.coverImage }] },
  }
}

export default function PackageDetailPage({ params }: Props) {
  const pkg = tourPackages.find((p) => p.slug === params.slug)
  if (!pkg) notFound()
  return <PackageDetailClient tourPackage={pkg} />
}
