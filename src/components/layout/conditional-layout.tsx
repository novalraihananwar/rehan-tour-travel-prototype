'use client'
import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'
import { Footer } from './footer'
import { FloatingWhatsApp } from './floating-whatsapp'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin  = pathname?.startsWith('/admin')  ?? false
  const isDriver = pathname?.startsWith('/driver')  ?? false
  const hideChrome = isAdmin || isDriver
  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <Footer />}
      {!hideChrome && <FloatingWhatsApp />}
    </>
  )
}
