'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Eye, Check, X, MessageCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Booking {
  code: string
  name: string
  email: string
  whatsapp: string
  package: string
  pickup: string
  pickupAddress: string
  date: string
  guests: number
  total: number
  paid: number
  status: string
  country: string
  vehicle: string
  created: string
  specialRequest: string
  paymentMethod: string
}

function capitalize(s: string) {
  if (!s) return 'Pending'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function derivePaid(status: string, total: number): number {
  const s = status?.toLowerCase()
  if (s === 'confirmed') return total
  if (s === 'partial') return Math.round(total / 2)
  return 0
}

function mapRow(b: Record<string, unknown>): Booking {
  const total = Number(b.total_usd) || 0
  const status = String(b.status || 'pending')
  return {
    code: String(b.code || ''),
    name: String(b.name || ''),
    email: String(b.email || ''),
    whatsapp: String(b.whatsapp || ''),
    package: String(b.package_title || b.package_id || '—'),
    pickup: String(b.pickup_name || '—'),
    pickupAddress: String(b.pickup_address || ''),
    date: String(b.date || '—'),
    guests: Number(b.guests) || 1,
    total,
    paid: derivePaid(status, total),
    status: capitalize(status),
    country: '🌍',
    vehicle: 'TBD',
    created: b.created_at ? String(b.created_at).slice(0, 10) : '—',
    specialRequest: String(b.special_request || '—'),
    paymentMethod: String(b.payment_method || '—'),
  }
}

const statusStyles: Record<string, string> = {
  Confirmed: 'bg-jungle/15 text-jungle-light border-jungle/25',
  Pending: 'bg-gold/15 text-gold border-gold/25',
  Partial: 'bg-ocean/15 text-ocean-light border-ocean/25',
  Cancelled: 'bg-lava/15 text-lava border-lava/25',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    async function load(silent = false) {
      if (!silent) setLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setBookings(data.map(mapRow))
      if (!silent) setLoading(false)
    }
    load()
    const interval = setInterval(() => load(true), 10000)
    return () => clearInterval(interval)
  }, [])

  const statuses = ['All', 'Confirmed', 'Pending', 'Partial', 'Cancelled']

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.package.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered.reduce((sum, b) => sum + b.paid, 0)
  const totalGuests = filtered.reduce((sum, b) => sum + b.guests, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Bookings</h1>
          {loading ? (
            <p className="text-sm text-cream-muted mt-0.5 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
            </p>
          ) : (
            <p className="text-sm text-cream-muted mt-0.5">
              {bookings.length} total · {bookings.filter((b) => b.status === 'Confirmed').length} confirmed
            </p>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-cream-muted hover:text-cream hover:border-sunset/30 transition-all">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (shown)', value: `$${totalRevenue.toLocaleString('en-US')}`, sub: 'from filtered results' },
          { label: 'Filtered Bookings', value: filtered.length, sub: 'of ' + bookings.length + ' total' },
          { label: 'Total Travelers', value: totalGuests, sub: 'guests in selection' },
          {
            label: 'Avg Booking Value',
            value: filtered.length ? `$${Math.round(totalRevenue / filtered.length)}` : '$0',
            sub: 'per booking',
          },
        ].map((c) => (
          <div key={c.label} className="glass-card rounded-2xl p-4">
            <div className="font-display text-xl text-cream font-bold">{c.value}</div>
            <div className="text-xs font-medium text-cream mt-0.5">{c.label}</div>
            <div className="text-xs text-cream-muted">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, code, package..."
            className="input-dark pl-9 text-sm py-2.5 w-full"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                statusFilter === s
                  ? 'bg-sunset/20 text-sunset border-sunset/30'
                  : 'text-cream-muted border-white/10 hover:border-sunset/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6">
                {['Booking Code', 'Traveler', 'Package', 'Departure', 'Guests', 'Total', 'Paid', 'Status', 'Actions'].map(
                  (h) => (
                    <th key={h} className="text-left py-3.5 px-4 text-cream-muted uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-cream-muted">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading bookings...
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((b) => (
                  <>
                    <tr
                      key={b.code}
                      className={`border-b border-white/3 hover:bg-white/2 cursor-pointer transition-colors ${
                        selected === b.code ? 'bg-sunset/5' : ''
                      }`}
                      onClick={() => setSelected(selected === b.code ? null : b.code)}
                    >
                      <td className="py-3.5 px-4 font-mono text-cream-muted">{b.code}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span>{b.country}</span>
                          <div>
                            <div className="text-cream font-medium">{b.name}</div>
                            <div className="text-cream-muted mt-0.5">{b.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-cream max-w-[160px] truncate">{b.package}</td>
                      <td className="py-3.5 px-4 text-cream-muted">{b.date}</td>
                      <td className="py-3.5 px-4 text-cream text-center">{b.guests}</td>
                      <td className="py-3.5 px-4 text-cream font-medium">${b.total}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={
                            b.paid === b.total ? 'text-jungle-light' : b.paid === 0 ? 'text-lava' : 'text-gold'
                          }
                        >
                          ${b.paid}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full border font-medium ${statusStyles[b.status] || ''}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1.5 rounded-lg hover:bg-white/8 text-cream-muted hover:text-cream transition-colors"
                            title="View detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}?text=Hi ${b.name.split(' ')[0]}, this is Rehan Tour regarding your booking ${b.code}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-wa/10 text-cream-muted hover:text-wa transition-colors"
                            title="WhatsApp"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          {b.status === 'Pending' && (
                            <button
                              className="p-1.5 rounded-lg hover:bg-jungle/15 text-cream-muted hover:text-jungle-light transition-colors"
                              title="Confirm"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {selected === b.code && (
                      <tr key={`${b.code}-expanded`} className="bg-sunset/3">
                        <td colSpan={9} className="px-4 py-4">
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs"
                          >
                            <div>
                              <p className="text-cream-muted uppercase tracking-wider mb-1">Pickup Point</p>
                              <p className="text-cream">{b.pickup}</p>
                              {b.pickupAddress && (
                                <p className="text-cream-muted mt-0.5 text-[11px]">{b.pickupAddress}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-cream-muted uppercase tracking-wider mb-1">Payment Method</p>
                              <p className="text-cream capitalize">{b.paymentMethod.replace('-', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-cream-muted uppercase tracking-wider mb-1">WhatsApp</p>
                              <p className="text-cream">{b.whatsapp}</p>
                            </div>
                            <div>
                              <p className="text-cream-muted uppercase tracking-wider mb-1">Booked On</p>
                              <p className="text-cream">{b.created}</p>
                            </div>
                            {b.specialRequest && b.specialRequest !== '—' && (
                              <div className="col-span-2">
                                <p className="text-cream-muted uppercase tracking-wider mb-1">Special Request</p>
                                <p className="text-cream">{b.specialRequest}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-cream-muted uppercase tracking-wider mb-1">Balance Due</p>
                              <p
                                className={`font-medium ${
                                  b.total - b.paid > 0 ? 'text-lava' : 'text-jungle-light'
                                }`}
                              >
                                ${b.total - b.paid > 0 ? b.total - b.paid : '0 — Fully Paid'}
                              </p>
                            </div>
                            <div className="col-span-4 flex items-center gap-2 pt-2 border-t border-white/5">
                              <button className="btn-primary text-xs py-1.5 px-4">Send Itinerary PDF</button>
                              <button className="btn-ghost text-xs py-1.5 px-4">Send Reminder</button>
                              {b.status !== 'Cancelled' && (
                                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-lava border border-lava/25 hover:bg-lava/10 transition-colors">
                                  <X className="w-3 h-3" /> Cancel Booking
                                </button>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-cream-muted text-sm">
            {bookings.length === 0
              ? 'No bookings yet. They will appear here once customers complete a booking.'
              : 'No bookings match your search.'}
          </div>
        )}
      </div>
    </div>
  )
}
