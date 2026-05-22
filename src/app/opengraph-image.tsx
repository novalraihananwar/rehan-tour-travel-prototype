import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rehan Tour & Travel — Premium East Java & Bali Adventures'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '60px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1200&q=80"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
          alt=""
        />
        {/* Dark gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0A 50%, rgba(10,10,10,0.3) 100%)' }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 48, left: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, background: '#E8703A', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#0A0A0A', fontWeight: 800, fontSize: 22 }}>R</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#F0E6D6', fontSize: 20, fontWeight: 600 }}>Rehan Tour & Travel</span>
            <span style={{ color: '#B8A898', fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase' }}>East Java & Bali</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ color: '#D4A843', fontSize: 15, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
            Premium Cinematic Travel
          </span>
          <span style={{ color: '#F0E6D6', fontSize: 54, fontWeight: 700, lineHeight: 1.1, maxWidth: 720 }}>
            East Java & Bali Adventures
          </span>
          <span style={{ color: '#B8A898', fontSize: 20, marginTop: 8 }}>
            Bromo · Ijen · Tumpak Sewu · Ubud · Uluwatu
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
