import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { destinations } from '@/lib/data'
import { DestinationDetailClient } from './client'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const dest = destinations.find((d) => d.slug === params.slug)
  if (!dest) return {}
  return {
    title: `${dest.name} — ${dest.tagline}`,
    description: dest.description,
    openGraph: {
      images: [{ url: dest.heroImage }],
    },
  }
}

export default function DestinationDetailPage({ params }: Props) {
  const dest = destinations.find((d) => d.slug === params.slug)
  if (!dest) notFound()
  return <DestinationDetailClient destination={dest} />
}
