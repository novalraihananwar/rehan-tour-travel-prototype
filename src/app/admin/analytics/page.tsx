'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Globe, ArrowUpRight, Download, Copy, Check, Loader2, CreditCard } from 'lucide-react'

const APPS_SCRIPT = `var API_BASE = 'https://rehan-tour-travel-prototype.vercel.app/api/sheets-csv';
var SHEETS = [
  ['Ringkasan', '/ringkasan'],
  ['Penjualan', '/penjualan'],
  ['Rekap Paket', '/rekap-paket'],
  ['Driver Aktif', '/driver-aktif'],
];

function syncFromAPI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var i = 0; i < SHEETS.length; i++) {
    var name = SHEETS[i][0];
    var url = API_BASE + SHEETS[i][1];
    try {
      var resp = UrlFetchApp.fetch(url);
      var data = Utilities.parseCsv(resp.getContentText());
      if (!data || data.length === 0) continue;
      var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
      sheet.clearContents();
      sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      var hdr = sheet.getRange(1, 1, 1, data[0].length);
      hdr.setFontWeight('bold');
      hdr.setBackground('#1C1815');
      hdr.setFontColor('#F0E6D6');
      sheet.setFrozenRows(1);
      for (var c = 1; c <= data[0].length; c++) sheet.autoResizeColumn(c);
    } catch(e) { Logger.log('Error ' + name + ': ' + e.message); }
  }
}

function setupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) ScriptApp.deleteTrigger(triggers[i]);
  ScriptApp.newTrigger('syncFromAPI').timeBased().everyMinutes(5).create();
}`

const CSV_ENDPOINTS = [
  { name: 'Ringkasan',    sheet: 'ringkasan',    desc: 'Total booking, revenue, driver online' },
  { name: 'Penjualan',    sheet: 'penjualan',    desc: 'Semua booking + detail per baris' },
  { name: 'Rekap Paket',  sheet: 'rekap-paket',  desc: 'Performa tiap paket wisata' },
  { name: 'Driver Aktif', sheet: 'driver-aktif', desc: 'Posisi & status driver saat ini' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="text-cream-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-medium">
            {p.name === 'Revenue' || p.name === 'revenue'
              ? `$${Number(p.value).toLocaleString('en-US')}`
              : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

interface AnalyticsData {
  monthlyData:        { month: string; revenue: number; bookings: number; passengers: number; avgValue: number }[]
  weeklyTrend:        { week: string; revenue: number }[]
  packageRevenueData: { name: string; revenue: number; bookings: number }[]
  paymentData:        { method: string; count: number; percentage: number }[]
  totalRevenue:    number
  totalBookings:   number
  totalPassengers: number
  avgBookingValue: number
}

export default function AnalyticsPage() {
  const [period, setPeriod]   = useState('6M')
  const [copied, setCopied]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData]       = useState<AnalyticsData | null>(null)

  useEffect(() => {
    async function load(silent = false) {
      if (!silent) setLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics?period=${period}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('API error ' + res.status)
        setData(await res.json())
      } catch (err) {
        console.error('Analytics load error:', err)
      } finally {
        if (!silent) setLoading(false)
      }
    }
    load()
    const interval = setInterval(() => load(true), 30000)
    return () => clearInterval(interval)
  }, [period])

  const copyScript = () => {
    try {
      navigator.clipboard.writeText(APPS_SCRIPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy script:', err)
    }
  }

  const fmt = (n: number) => n > 0 ? `$${n.toLocaleString('en-US')}` : '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Analytics</h1>
          <p className="text-sm text-cream-muted mt-0.5">
            {loading ? 'Loading real data...' : `${data?.totalBookings ?? 0} bookings · live from Supabase`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 text-cream-muted animate-spin" />}
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
          { icon: DollarSign, label: 'Total Revenue',      value: data ? fmt(data.totalRevenue)    : '—', color: 'gold' },
          { icon: Users,      label: 'Total Passengers',   value: data ? String(data.totalPassengers) : '—', color: 'jungle' },
          { icon: TrendingUp, label: 'Avg Booking Value',  value: data ? fmt(data.avgBookingValue)  : '—', color: 'sunset' },
          { icon: Globe,      label: 'Total Bookings',     value: data ? String(data.totalBookings) : '—', color: 'ocean' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              c.color === 'gold'   ? 'bg-gold/15 text-gold'
              : c.color === 'jungle' ? 'bg-jungle/15 text-jungle-light'
              : c.color === 'sunset' ? 'bg-sunset/15 text-sunset'
              : 'bg-ocean/15 text-ocean-light'
            }`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div className="font-display text-2xl font-bold text-cream">{c.value}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-cream-muted">{c.label}</span>
              <span className="text-xs text-jungle-light flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />Live
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <h3 className="text-sm font-medium text-cream mb-1">Revenue & Passengers Over Time</h3>
          <p className="text-xs text-cream-muted mb-4">Monthly aggregation · real bookings</p>
          {(!data || data.monthlyData.length === 0) ? (
            <div className="h-[220px] flex items-center justify-center text-cream-muted text-sm">
              No booking data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.monthlyData || []}>
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
                <Area type="monotone" dataKey="revenue"    name="Revenue"    stroke="#E8703A" strokeWidth={2} fill="url(#revGrad2)" />
                <Area type="monotone" dataKey="passengers" name="Passengers" stroke="#3A8A65" strokeWidth={2} fill="url(#passGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Weekly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="text-sm font-medium text-cream mb-1">Weekly Revenue</h3>
          <p className="text-xs text-cream-muted mb-4">Last 8 weeks · real bookings</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.weeklyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#8A7A6A', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A7A6A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#D4A843" strokeWidth={2.5} dot={{ fill: '#D4A843', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Package revenue + Payment breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <h3 className="text-sm font-medium text-cream mb-1">Revenue by Package</h3>
          <p className="text-xs text-cream-muted mb-4">All-time · real bookings</p>
          {(!data || data.packageRevenueData.length === 0) ? (
            <div className="h-[220px] flex items-center justify-center text-cream-muted text-sm">No booking data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.packageRevenueData || []} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#8A7A6A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#B8A899', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#E8703A" radius={[0, 4, 4, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Payment method breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-sunset" />
            <h3 className="text-sm font-medium text-cream">Payment Methods</h3>
          </div>
          {!data || data.paymentData.length === 0 ? (
            <div className="py-8 text-center text-cream-muted text-sm">No data yet</div>
          ) : (
            <div className="space-y-3">
              {data.paymentData.map((p) => (
                <div key={p.method}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-cream capitalize">{p.method}</span>
                    <span className="text-cream-muted">{p.count} ({p.percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-volcanic-500 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-sunset to-gold"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Google Sheets Sync */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-jungle/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-jungle-light" />
          </div>
          <h3 className="text-sm font-medium text-cream">Google Sheets Auto-Sync</h3>
        </div>
        <p className="text-xs text-cream-muted mb-5">
          Data booking, paket, dan driver bisa disync otomatis ke Google Sheets tiap 5 menit.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {CSV_ENDPOINTS.map(ep => (
            <div key={ep.sheet} className="glass-card rounded-xl p-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-cream">{ep.name}</p>
                <p className="text-xs text-cream-muted">{ep.desc}</p>
              </div>
              <a
                href={`/api/sheets-csv/${ep.sheet}`}
                target="_blank"
                className="shrink-0 p-1.5 rounded-lg bg-sunset/10 text-sunset hover:bg-sunset/20 transition-colors"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-cream">Google Apps Script</p>
            <button
              onClick={copyScript}
              className="flex items-center gap-1.5 text-xs text-cream-muted hover:text-cream transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-jungle-light" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Copy script'}
            </button>
          </div>
          <pre className="text-xs text-cream-muted bg-volcanic-400/50 rounded-xl p-4 overflow-x-auto leading-relaxed max-h-48">
            {APPS_SCRIPT}
          </pre>
        </div>
      </motion.div>
    </div>
  )
}
