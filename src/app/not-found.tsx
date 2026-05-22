import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-volcanic flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80"
          alt="Mountain"
          fill
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-volcanic via-volcanic/80 to-volcanic" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
        <p className="text-sunset text-sm tracking-widest uppercase mb-4">404</p>
        <h1 className="font-display text-5xl sm:text-6xl text-cream mb-4 leading-tight">
          Trail Not Found
        </h1>
        <p className="text-cream-muted text-lg mb-2">
          The path you&apos;re looking for doesn&apos;t exist.
        </p>
        <p className="text-cream-muted/60 text-sm mb-10">
          Maybe you took a wrong turn on the way to Bromo. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-3 text-sm">
            Back to Homepage
          </Link>
          <Link href="/packages" className="btn-ghost px-6 py-3 text-sm">
            View Packages
          </Link>
          <Link href="/contact" className="btn-ghost px-6 py-3 text-sm">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
