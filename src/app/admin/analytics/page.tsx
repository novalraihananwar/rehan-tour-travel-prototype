'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Globe, ArrowUpRight } from 'lucide-react'

const monthlyData = [
  { month: 'Jan', revenue: 12400, bookings: 34, passengers: 187, avgValue: 365 },
  { month: 'Feb', revenue: 15800, bookings: 42, passengers: 231, avgValue: 376 },
  { month: 'Mar', revenue: 18200, bookings: 51, passengers: 280, avgValue: 357 },
  { month: 'Apr', revenue: 22500, bookings: 63, passengers: 347, avgValue: 357 },
  { month: 'May', revenue: 28900, bookings: 78, passengers: 429, avgValue: 371 },
  { month: 'Jun', revenue: 35200, bookings: 94, passengers: 517, avgValue: 374 },
]

const nationalityData = [
  { country: '🇯🇵 Japan', bookings: 312, percentage: 22 },
  { country: '🇩🇪 Germany', bookings: 198, percentage: 14 },
  { country: '🇦🇺 Australia', bookings: 187, percentage: 13 },
  { country: '🇰🇷 Korea', bookings: 165, percentage: 12 },
  { country: '🇳🇱 Netherlands', bookings: 112, percentage: 8 },
  { country: '🇺🇸 USA', bookings: 98, percentage: 7 },
  { country: '🇫🇷 France', bookings: 87, percentage: 6 },
  { country: '🇬🇧 UK', bookings: 76, percentage: 5 },
  { country: 'Others (30 countries)', bookings: 184, percentage: 13 },
]

const packageRevenueData = [
  { name: 'Bromo Sunrise', revenue: 24648, bookings: 312 },
  { name: 'Bromo + Ijen', revenue: 36465, bookings: 187 },
  { name: 'Java → Bali', revenue: 49335, bookings: 143 },
  { name: 'Bali Escape', revenue: 28322, bookings: 98 },
  { name: 'Honeymoon', revenue: 37180, bookings: 44 },
  { name: 'Tumpak Sewu', revenue: 6110, bookings: 94 },
  { name: 'Malang Tour', revenue: 10388, bookings: 212 },
  { name: 'Luxury EJ', revenue: 20150, bookings: 31 },
]

const weeklyTrend = [
  { week: 'W1 Apr', revenue: 4800 },
  { week: 'W2 Apr', revenue: 5600 },
  { week: 'W3 Apr', revenue: 6100 },
  { week: 'W4 Apr', revenue: 6000 },
  { week: 'W1 May', revenue: 6800 },
  { week: 'W2 May', revenue: 7400 },
  { week: 'W3 May', revenue: 8200 },
  { week: 'W4 May', revenue: 6500 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="text-cream-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-medium">{p.name === 'Revenue' || p.name === 'revenue' ? `$${Number(p.value).toLocaleString('en-US')}` : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6M')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Analytics</h1>
          <p className="text-sm text-cream-muted mt-0.5">Revenue, bookings, passenger trends</p>
        </div>
        <div className="flex gap-2">
          {['1M', '3M', '6M', '1Y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${period === p ? 'bg-sunset/20 text-sunset border-sunset/30' : 'text-cream-muted border-white/10 hover:border-sunset/20'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Revenue (6M)', value: '$133,000', change: '+42%', color: 'gold' },
          { icon: Users, label: 'Total Passengers (6M)', value: '1,991', change: '+38%', color: 'jungle' },
          { icon: TrendingUp, label: 'Avg Booking Value', value: '$371', change: '+2.7%', color: 'sunset' },
          { icon: Globe, label: 'Nationalities Served', value: '38', change: '+6 new', color: 'ocean' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              c.color === 'gold' ? 'bg-gold/15 text-gold' : c.color === 'jungle' ? 'bg-jungle/15 text-jungle-light' : c.color === 'sunset' ? 'bg-sunset/15 text-sunset' : 'bg-ocean/15 text-ocean-light'
            }`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div className="font-display text-2xl font-bold text-cream">{c.value}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-cream-muted">{c.label}</span>
              <span className="text-xs text-jungle-light flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />{c.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <h3 className="text-sm font-medium text-cream mb-1">Revenue & Passengers Over Time</h3>
          <p className="text-xs text-cream-muted mb-4">January–June 2026</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8703A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E8703A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A8A65" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3A8A65" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#8A7A6A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A7A6A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8A7A6A' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#E8703A" strokeWidth={2} fill="url(#revGrad2)" />
              <Area type="monotone" dataKey="passengers" name="Passengers" stroke="#3A8A65" strokeWidth={2} fill="url(#passGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="text-sm font-medium text-cream mb-1">Weekly Revenue</h3>
          <p className="text-xs text-cream-muted mb-4">Apr–May 2026</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#8A7A6A', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A7A6A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#D4A843" strokeWidth={2.5} dot={{ fill: '#D4A843', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Package revenue bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="text-sm font-medium text-cream mb-1">Revenue by Package</h3>
        <p className="text-xs text-cream-muted mb-4">All-time cumulative</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={packageRevenueData} layout="vertical" barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#8A7A6A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#B8A899', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" name="Revenue" fill="#E8703A" radius={[0, 4, 4, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Nationality breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="text-sm font-medium text-cream mb-4">Bookings by Nationality</h3>
        <div className="space-y-3">
          {nationalityData.map((n) => (
            <div key={n.country} className="flex items-center gap-3">
              <span className="text-sm text-cream w-48 shrink-0">{n.country}</span>
              <div className="flex-1 h-2 bg-volcanic-500 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${n.percentage}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full rounded-full bg-gradient-to-r from-sunset to-gold"
                />
              </div>
              <span className="text-xs text-cream-muted w-16 text-right">{n.bookings} ({n.percentage}%)</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
