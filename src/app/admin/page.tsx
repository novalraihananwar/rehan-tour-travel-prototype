'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts'
import {
  Truck, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowRight,
  Clock, Activity, Zap, Calendar,
} from 'lucide-react'
import { fleetVehicles, departureSchedule } from '@/lib/data'

const monthlyData = [
  { month: 'Jan', revenue: 12400, bookings: 34, passengers: 187 },
  { month: 'Feb', revenue: 15800, bookings: 42, passengers: 231 },
  { month: 'Mar', revenue: 18200, bookings: 51, passengers: 280 },
  { month: 'Apr', revenue: 22500, bookings: 63, passengers: 347 },
  { month: 'May', revenue: 28900, bookings: 78, passengers: 429 },
  { month: 'Jun', revenue: 35200, bookings: 94, passengers: 517 },
]

const fleetStatusData = [
  { name: 'Available', value: 10, color: '#3A8A65' },
  { name: 'On Trip', value: 12, color: '#E8703A' },
  { name: 'Standby', value: 4, color: '#D4A843' },
  { name: 'Fully Booked', value: 2, color: '#C0392B' },
  { name: 'Maintenance', value: 2, color: '#8A7A6A' },
]

const topPackages = [
  { name: 'Bromo Sunrise Classic', bookings: 312, revenue: 24648, change: +18 },
  { name: 'Bromo + Ijen Expedition', bookings: 187, revenue: 36465, change: +24 },
  { name: 'East Java to Bali Overland', bookings: 143, revenue: 49335, change: +31 },
  { name: 'Bali Tropical Escape', bookings: 98, revenue: 28322, change: +12 },
  { name: 'Tumpak Sewu Trek', bookings: 94, revenue: 6110, change: +8 },
]

const recentBookings = [
  { code: 'RTT-4K2X-7M', name: 'Haruto Yamamoto', package: 'Bromo + Ijen', date: '2026-05-25', guests: 2, total: 390, status: 'Confirmed', country: '🇯🇵' },
  { code: 'RTT-9P1Z-3Q', name: 'Lena Schreiber', package: 'East Java → Bali', date: '2026-05-28', guests: 3, total: 1035, status: 'Confirmed', country: '🇩🇪' },
  { code: 'RTT-2R8W-5N', name: 'Sophie Reynolds', package: 'Bali Tropical Escape', date: '2026-06-01', guests: 3, total: 867, status: 'Pending', country: '🇦🇺' },
  { code: 'RTT-7F4T-1L', name: 'Ji-Ho Seo', package: 'Bromo Sunrise', date: '2026-05-22', guests: 2, total: 158, status: 'Confirmed', country: '🇰🇷' },
  { code: 'RTT-6M3A-9C', name: 'Thomas Vandermeer', package: 'Tumpak Sewu Trek', date: '2026-05-23', guests: 1, total: 65, status: 'Confirmed', country: '🇳🇱' },
]

const kpiCards = [
  {
    icon: DollarSign,
    label: 'Monthly Revenue',
    value: '$35,200',
    change: '+18%',
    sub: 'vs April 2026',
    color: 'gold',
  },
  {
    icon: Users,
    label: 'Active Bookings',
    value: '94',
    change: '+23%',
    sub: 'this month',
    color: 'jungle',
  },
  {
    icon: Truck,
    label: 'Fleet Utilization',
    value: '93%',
    change: '+5%',
    sub: '28 of 30 vehicles active',
    color: 'sunset',
  },
  {
    icon: TrendingUp,
    label: 'Avg Rating',
    value: '4.91',
    change: '+0.04',
    sub: 'from 3,247 reviews',
    color: 'ocean',
  },
]

const colorMap: Record<string, string> = {
  sunset: 'text-sunset bg-sunset/15',
  jungle: 'text-jungle-light bg-jungle/15',
  gold: 'text-gold bg-gold/15',
  ocean: 'text-ocean-light bg-ocean/15',
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    confirmed: 'bg-jungle/15 text-jungle-light border-jungle/25',
    pending:   'bg-gold/15 text-gold border-gold/25',
    partial:   'bg-ocean/15 text-ocean-light border-ocean/25',
    cancelled: 'bg-lava/15 text-lava border-lava/25',
  }
  return map[status?.toLowerCase()] || 'bg-white/8 text-cream-muted border-white/10'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="text-cream-muted mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name?.includes('Revenue') ? `$${p.value.toLocaleString('en-US')}` : p.value}</p>
      ))}
    </div>
  )
}

interface AdminStats {
  totalBookings: number
  confirmedCount: number
  pendingCount: number
  totalRevenue: number
  todayBookings: number
  todayRevenue: number
  driversOnTrip: number
  driversAvail: number
  totalDrivers: number
  recentBookings: Array<{
    code?: string
    name: string
    package_title: string
    date?: string
    guests: number
    total_usd: number
    status: string
    created_at: string
  }>
}

export default function AdminOverview() {
  const [dateStr, setDateStr] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' })
        const data = await res.json()
        setStats(data)
      } catch { /* use mock data */ } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Overview</h1>
          <p className="text-sm text-cream-muted mt-0.5">{dateStr || 'Admin Dashboard'}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-jungle-light bg-jungle/10 border border-jungle/20 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-jungle-light animate-pulse" />
          Live — updates every 10s
        </div>
      </div>

      {/* KPI Cards — real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: DollarSign, label: 'Total Revenue',
            value: stats ? `$${stats.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—',
            sub: `Today: $${stats?.todayRevenue?.toFixed(0) || 0}`,
            color: 'gold',
          },
          {
            icon: Users, label: 'Total Bookings',
            value: stats ? String(stats.totalBookings) : '—',
            sub: `${stats?.confirmedCount || 0} confirmed · ${stats?.pendingCount || 0} pending`,
            color: 'jungle',
          },
          {
            icon: Truck, label: 'Active Drivers',
            value: stats ? String(stats.driversOnTrip) : '—',
            sub: `${stats?.driversAvail || 0} available · ${stats?.totalDrivers || 0} online`,
            color: 'sunset',
          },
          {
            icon: TrendingUp, label: "Today's Bookings",
            value: stats ? String(stats.todayBookings) : '—',
            sub: 'New bookings today',
            color: 'ocean',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[card.color]}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 text-xs text-jungle-light">
                <ArrowUpRight className="w-3 h-3" />
                Live
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-cream">{card.value}</div>
            <div className="text-xs font-medium text-cream mt-0.5">{card.label}</div>
            <div className="text-xs text-cream-muted mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue + bookings area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-medium text-cream text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-sunset" /> Revenue & Bookings
              </h3>
              <p className="text-xs text-cream-muted mt-0.5">Jan–Jun 2026</p>
            </div>
            <Link href="/admin/analytics" className="text-xs text-sunset hover:text-gold transition-colors flex items-center gap-1">
              Full Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8703A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E8703A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#8A7A6A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A7A6A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#E8703A" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#D4A843" strokeWidth={2} fill="url(#bookGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Fleet donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-cream text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-sunset" /> Fleet Status
            </h3>
            <div className="flex items-center gap-3">
              <Link href="/admin/drivers" className="text-xs text-jungle-light hover:text-jungle transition-colors">
                Live Map →
              </Link>
              <Link href="/admin/fleet" className="text-xs text-sunset hover:text-gold transition-colors">
                Manage →
              </Link>
            </div>
          </div>
          <p className="text-xs text-cream-muted mb-4">Real-time, 30 vehicles</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={fleetStatusData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value" paddingAngle={3}>
                {fleetStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {fleetStatusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-cream-muted">{s.name}</span>
                </div>
                <span className="text-cream font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent bookings + Top packages */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 glass-card rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-medium text-cream text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-sunset" /> Recent Bookings
            </h3>
            <Link href="/admin/bookings" className="text-xs text-sunset hover:text-gold transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/4">
                  {['Code', 'Traveler', 'Package', 'Date', 'Total', 'Status'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-cream-muted uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!stats && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-cream-muted text-xs">
                      Loading...
                    </td>
                  </tr>
                )}
                {stats?.recentBookings.map((b, i) => (
                  <tr key={b.code || i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4 font-mono text-cream-muted text-xs">{b.code || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="text-cream font-medium">{b.name}</span>
                    </td>
                    <td className="py-3 px-4 text-cream-muted max-w-[140px] truncate">{b.package_title}</td>
                    <td className="py-3 px-4 text-cream-muted">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-gold font-medium">
                      {Number(b.total_usd) > 0 ? `$${Number(b.total_usd).toFixed(0)}` : <span className="text-cream-muted text-[11px]">TBD</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-medium capitalize ${statusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats?.recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-cream-muted text-xs">
                      No bookings yet — they appear here once customers book.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-cream text-sm">Top Packages</h3>
            <Link href="/admin/packages" className="text-xs text-sunset hover:text-gold transition-colors">
              Manage →
            </Link>
          </div>
          <div className="space-y-3">
            {topPackages.map((pkg, i) => (
              <div key={pkg.name} className="flex items-center gap-3">
                <span className="text-xs font-bold font-display text-cream-muted w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cream font-medium truncate">{pkg.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-cream-muted">{pkg.bookings} bookings</span>
                    <span className="text-xs text-gold">${pkg.revenue.toLocaleString('en-US')}</span>
                  </div>
                </div>
                <span className="text-xs text-jungle-light flex items-center gap-0.5 shrink-0">
                  <ArrowUpRight className="w-3 h-3" />{pkg.change}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming departures + Fleet quick view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming departures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-cream text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sunset" /> Upcoming Departures
            </h3>
          </div>
          <div className="space-y-3">
            {departureSchedule.map((dep) => (
              <div key={dep.date} className="flex items-center justify-between p-3 bg-volcanic-400/40 rounded-xl">
                <div>
                  <p className="text-sm text-cream font-medium">{dep.package}</p>
                  <p className="text-xs text-cream-muted mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(dep.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border block mb-1 ${
                    dep.status === 'Limited' ? 'bg-lava/15 text-lava border-lava/25' : 'bg-jungle/15 text-jungle-light border-jungle/25'
                  }`}>
                    {dep.status}
                  </span>
                  <span className="text-xs text-cream-muted">{dep.seats} seats left</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fleet quick status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-cream text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-sunset" /> Active Fleet
            </h3>
            <Link href="/admin/fleet" className="text-xs text-sunset hover:text-gold transition-colors flex items-center gap-1">
              Full view <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {fleetVehicles.slice(0, 6).map((v) => {
              const dotColor = v.status === 'Available' ? 'bg-jungle-light' : v.status === 'On Trip' ? 'bg-sunset' : v.status === 'Fully Booked' ? 'bg-lava' : v.status === 'Standby' ? 'bg-gold' : 'bg-cream-muted'
              return (
                <div key={v.id} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor} ${v.status === 'On Trip' ? 'animate-pulse' : ''}`} />
                  <span className="font-mono text-xs text-cream-muted w-20">{v.id}</span>
                  <span className="text-xs text-cream flex-1 truncate">{v.driver}</span>
                  <span className="text-xs text-cream-muted">{v.currentRoute || v.status}</span>
                  {v.status === 'On Trip' && (
                    <span className="text-xs text-sunset">{v.occupancy}/{v.capacity}</span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
