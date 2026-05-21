'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Truck, BookOpen, Package, BarChart2,
  Star, LogOut, Menu, X, ChevronRight, Bell, Search,
} from 'lucide-react'

const NAV_BASE = [
  { href: '/admin',           label: 'Overview',        icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings',  label: 'Bookings',        icon: BookOpen },
  { href: '/admin/fleet',     label: 'Fleet & Drivers', icon: Truck },
  { href: '/admin/packages',  label: 'Packages',        icon: Package },
  { href: '/admin/analytics', label: 'Analytics',       icon: BarChart2 },
  { href: '/admin/reviews',   label: 'Reviews',         icon: Star },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [isAuth, setIsAuth]             = useState<boolean | null>(null)
  const [newBookings, setNewBookings]         = useState(0)
  const [pendingCount, setPendingCount]       = useState(0)
  const [pendingDriversCount, setPendingDriversCount] = useState(0)
  const [searchQuery, setSearchQuery]         = useState('')

  // Auth check
  useEffect(() => {
    if (pathname === '/admin/login') { setIsAuth(true); return }
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('admin_auth') !== 'true') {
        setIsAuth(false)  // BUG-6: prevent stuck null state
        router.replace('/admin/login')
      } else {
        setIsAuth(true)
      }
    }
  }, [pathname, router])

  // Booking badge — shows new bookings since last visit to /admin/bookings
  useEffect(() => {
    if (!isAuth) return
    const computeBadge = async () => {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Badge fetch failed: ${res.status}`)
        const data = await res.json()
        const seen = parseInt(localStorage.getItem('admin_seen_bookings') || '0')
        setNewBookings(Math.max(0, (data.totalBookings || 0) - seen))
        setPendingCount(data.pendingCount || 0)
      } catch (err) {
        console.error('[AdminLayout] badge fetch error:', err)
      }
      // Fetch pending driver registrations
      fetch('/api/admin/driver-approval', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : { drivers: [] })
        .then(d => setPendingDriversCount((d.drivers || []).length))
        .catch(() => {})
    }
    computeBadge()
    const interval = setInterval(computeBadge, 15000)
    return () => clearInterval(interval)
  }, [isAuth])

  // Clear badge when visiting bookings page
  useEffect(() => {
    if (pathname === '/admin/bookings') {
      fetch('/api/admin/stats', { cache: 'no-store' })
        .then(r => {
          if (!r.ok) throw new Error(`Badge clear failed: ${r.status}`)
          return r.json()
        })
        .then(data => {
          localStorage.setItem('admin_seen_bookings', String(data.totalBookings || 0))
          setNewBookings(0)
        })
        .catch((err) => {
          console.error('[AdminLayout] badge clear error:', err)
        })
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    router.push('/admin/login')
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  if (pathname === '/admin/login') return <>{children}</>

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-volcanic flex items-center justify-center">
        <div className="text-cream-muted text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-volcanic flex">
      {/* ── Sidebar ── */}
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-volcanic-200 border-r border-white/6 min-h-screen fixed left-0 top-0 bottom-0 z-30">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-sunset-gradient rounded-lg flex items-center justify-center">
              <span className="text-volcanic font-bold font-display text-sm">R</span>
            </div>
            <div>
              <div className="text-sm font-medium text-cream">Rehan Tour</div>
              <div className="text-xs text-cream-muted">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-cream-muted uppercase tracking-widest px-3 mb-3">Management</p>
          {NAV_BASE.map((item) => {
            const active = isActive(item.href, item.exact)
            const badge  = item.href === '/admin/bookings' && newBookings > 0
            ? String(newBookings)
            : item.href === '/admin/fleet' && pendingDriversCount > 0
              ? String(pendingDriversCount)
              : undefined
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-sunset/15 text-sunset border border-sunset/20'
                    : 'text-cream-muted hover:text-cream hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-sunset' : 'text-cream-muted group-hover:text-cream'}`} />
                <span className="flex-1">{item.label}</span>
                {badge && (
                  <span className="text-xs bg-sunset text-volcanic px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                    {badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3 h-3 text-sunset" />}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-white/6">
            <p className="text-xs text-cream-muted uppercase tracking-widest px-3 mb-3">Account</p>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cream-muted hover:text-cream hover:bg-white/5 transition-all">
              <LogOut className="w-4 h-4" />
              Back to Site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cream-muted hover:text-lava hover:bg-lava/8 transition-all"
            >
              <LogOut className="w-4 h-4 rotate-180" />
              Logout
            </button>
          </div>
        </nav>

        {/* Status indicator */}
        <div className="px-4 py-4 border-t border-white/6">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-jungle/10 border border-jungle/20">
            <div className="w-2 h-2 rounded-full bg-jungle-light animate-pulse" />
            <span className="text-xs text-jungle-light font-medium">System Online</span>
            <span className="text-xs text-cream-muted ml-auto">v2.4.1</span>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-volcanic-200 border-r border-white/6 z-50 lg:hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-white/6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sunset-gradient rounded-lg flex items-center justify-center">
                    <span className="text-volcanic font-bold font-display text-sm">R</span>
                  </div>
                  <span className="text-sm font-medium text-cream">Admin Panel</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-cream-muted hover:text-cream">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_BASE.map((item) => {
                  const active = isActive(item.href, item.exact)
                  const badge  = item.href === '/admin/bookings' && newBookings > 0
            ? String(newBookings)
            : item.href === '/admin/fleet' && pendingDriversCount > 0
              ? String(pendingDriversCount)
              : undefined
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-sunset/15 text-sunset border border-sunset/20' : 'text-cream-muted hover:text-cream hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {badge && <span className="text-xs bg-sunset text-volcanic px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
                    </Link>
                  )
                })}
                <div className="pt-4 mt-4 border-t border-white/6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cream-muted hover:text-lava hover:bg-lava/8 transition-all"
                  >
                    <LogOut className="w-4 h-4 rotate-180" />
                    Logout
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-white/5 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search — BUG-4: controlled input with Enter-key submit */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/admin?q=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
              placeholder="Search bookings, drivers, packages..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-volcanic-400/50 border border-white/8 rounded-xl text-cream placeholder:text-cream-muted outline-none focus:border-sunset/40 focus:bg-volcanic-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification bell — BUG-5: dot only shown when pendingCount > 0 */}
            <button className="relative p-2 rounded-xl text-cream-muted hover:text-cream hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sunset" />
              )}
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-sunset-gradient flex items-center justify-center">
                <span className="text-xs font-bold text-volcanic">A</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-medium text-cream">Admin</div>
                <div className="text-xs text-cream-muted">Rehan Tour</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
