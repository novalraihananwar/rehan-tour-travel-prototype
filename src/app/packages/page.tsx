import type { Metadata } from 'next'
import { PackagesPageClient } from './client'

export const metadata: Metadata = {
  title: 'Tour Packages — East Java & Bali Adventures',
  description: 'Browse all our curated tour packages: Bromo Sunrise, Ijen Crater, Tumpak Sewu, Surabaya to Bali overland, luxury & honeymoon tours.',
}

export default function PackagesPage() {
  return <PackagesPageClient />
}
