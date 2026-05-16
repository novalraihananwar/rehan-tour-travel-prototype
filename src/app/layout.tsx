import type { Metadata } from 'next'
import { Cormorant, DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ConditionalLayout } from '@/components/layout/conditional-layout'

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Rehan Tour & Travel — Premium East Java & Bali Adventures',
    template: '%s | Rehan Tour & Travel',
  },
  description:
    'Cinematic overland adventures across East Java and Bali. Mount Bromo sunrise, Ijen blue fire, Tumpak Sewu waterfall, and Bali island escapes. Premium Toyota HiAce tours for international travelers.',
  keywords: [
    'East Java tour', 'Bali tour', 'Mount Bromo', 'Ijen crater', 'Tumpak Sewu',
    'Toyota HiAce travel', 'Surabaya to Bali overland', 'Indonesia travel', 'volcano tour',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rehantour.id',
    siteName: 'Rehan Tour & Travel',
    title: 'Rehan Tour & Travel — Premium East Java & Bali Adventures',
    description: 'Cinematic overland adventures across East Java and Bali.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Mount Bromo volcanic sunrise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rehan Tour & Travel',
    description: 'Cinematic adventures across East Java and Bali.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="bg-volcanic text-cream antialiased">
        <Providers>
          <ConditionalLayout>
            <main>{children}</main>
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  )
}
