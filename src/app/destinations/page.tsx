import type { Metadata } from 'next'
import { DestinationsPageClient } from './client'

export const metadata: Metadata = {
  title: 'Destinations — East Java & Bali',
  description: 'Explore all destinations in East Java and Bali. Mount Bromo, Ijen Crater, Tumpak Sewu, Ubud, Uluwatu, Nusa Penida and more.',
}

export default function DestinationsPage() {
  return <DestinationsPageClient />
}
