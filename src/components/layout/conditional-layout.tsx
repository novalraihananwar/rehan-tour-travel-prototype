'use client'
import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'
import { Footer } from './footer'
import { FloatingWhatsApp } from './floating-whatsapp'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin') ?? false
  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingWhatsApp />}
    </>
  )
}
