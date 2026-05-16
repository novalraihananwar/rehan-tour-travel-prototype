'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Eye, Check, X, ChevronDown, MessageCircle } from 'lucide-react'

const allBookings = [
  { code: 'RTT-4K2X-7M', name: 'Haruto Yamamoto', email: 'haruto@gmail.com', whatsapp: '+81-90-1234-5678', package: 'Bromo + Ijen Expedition', pickup: 'Juanda Airport T1', date: '2026-05-25', guests: 2, total: 390, paid: 390, status: 'Confirmed', country: '🇯🇵', vehicle: 'RTT-001', created: '2026-05-10' },
  { code: 'RTT-9P1Z-3Q', name: 'Lena Schreiber', email: 'lena.s@gmail.com', whatsapp: '+49-172-3456789', package: 'East Java to Bali Overland', pickup: 'Gubeng Station', date: '2026-05-28', guests: 3, total: 1035, paid: 1035, status: 'Confirmed', country: '🇩🇪', vehicle: 'RTT-003', created: '2026-05-11' },
  { code: 'RTT-2R8W-5N', name: 'Sophie Reynolds', email: 'sophie.r@outlook.com', whatsapp: '+61-412-345678', package: 'Bali Tropical Escape', pickup: 'Ngurah Rai Airport', date: '2026-06-01', guests: 3, total: 867, paid: 0, status: 'Pending', country: '🇦🇺', vehicle: 'RTT-007', created: '2026-05-12' },
  { code: 'RTT-7F4T-1L', name: 'Ji-Ho Seo', email: 'jiho.seo@naver.com', whatsapp: '+82-10-9876-5432', package: 'Bromo Sunrise Classic', pickup: 'Malang Kota Baru Station', date: '2026-05-22', guests: 2, total: 158, paid: 158, status: 'Confirmed', country: '🇰🇷', vehicle: 'RTT-002', created: '2026-05-09' },
  { code: 'RTT-6M3A-9C', name: 'Thomas Vandermeer', email: 'thomas@hotmail.com', whatsapp: '+31-612-345678', package: 'Tumpak Sewu Waterfall Trek', pickup: 'Arjosari Terminal', date: '2026-05-23', guests: 1, total: 65, paid: 65, status: 'Confirmed', country: '🇳🇱', vehicle: 'RTT-004', created: '2026-05-08' },
  { code: 'RTT-3B5K-2H', name: 'Yuki Tanaka', email: 'yuki.t@icloud.com', whatsapp: '+81-80-9012-3456', package: 'Honeymoon in Bali', pickup: 'Ngurah Rai Airport', date: '2026-06-14', guests: 2, total: 1690, paid: 845, status: 'Partial', country: '🇯🇵', vehicle: 'TBD', created: '2026-05-13' },
  { code: 'RTT-5X7P-8D', name: 'Marco Rossi', email: 'm.rossi@gmail.com', whatsapp: '+39-346-1234567', package: 'Bromo Sunrise Classic', pickup: 'Tunjungan Plaza Area', date: '2026-05-22', guests: 4, total: 316, paid: 316, status: 'Confirmed', country: '🇮🇹', vehicle: 'RTT-002', created: '2026-05-07' },
  { code: 'RTT-8A2Y-6F', name: 'Emma Laurent', email: 'emma.l@gmail.com', whatsapp: '+33-6-1234-5678', package: 'Malang Hidden Gems', pickup: 'Malang Kota Baru Station', date: '2026-05-21', guests: 2, total: 98, paid: 98, status: 'Confirmed', country: '🇫🇷', vehicle: 'RTT-008', created: '2026-05-06' },
]

const statusStyles: Record<string, string> = {
  Confirmed: 'bg-jungle/15 text-jungle-light border-jungle/25',
  Pending: 'bg-gold/15 text-gold border-gold/25',
  Partial: 'bg-ocean/15 text-ocean-light border-ocean/25',
  Cancelled: 'bg-lava/15 text-lava border-lava/25',
}

export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

  const statuses = ['All', 'Confirmed', 'Pending', 'Partial', 'Cancelled']

  const filtered = allBookings.filter((b) => {
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase()) || b.package.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered.reduce((sum, b) => sum + b.paid, 0)
  const totalGuests = filtered.reduce((sum, b) => sum + b.guests, 0)

  const expandedBooking = selected ? allBookings.find((b) => b.code === selected) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Bookings</h1>
          <p className="text-sm text-cream-muted mt-0.5">{allBookings.length} total · {allBookings.filter(b => b.status === 'Confirmed').length} confirmed</p>
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
          { label: 'Filtered Bookings', value: filtered.length, sub: 'of ' + allBookings.length + ' total' },
          { label: 'Total Travelers', value: totalGuests, sub: 'guests in selection' },
          { label: 'Avg Booking Value', value: filtered.length ? `$${Math.round(totalRevenue / filtered.length)}` : '$0', sub: 'per booking' },
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
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${statusFilter === s ? 'bg-sunset/20 text-sunset border-sunset/30' : 'text-cream-muted border-white/10 hover:border-sunset/20'}`}
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
                {['Booking Code', 'Traveler', 'Package', 'Departure', 'Guests', 'Total', 'Paid', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3.5 px-4 text-cream-muted uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <>
                  <tr
                    key={b.code}
                    className={`border-b border-white/3 hover:bg-white/2 cursor-pointer transition-colors ${selected === b.code ? 'bg-sunset/5' : ''}`}
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
                      <span className={b.paid === b.total ? 'text-jungle-light' : b.paid === 0 ? 'text-lava' : 'text-gold'}>
                        ${b.paid}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full border font-medium ${statusStyles[b.status] || ''}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-white/8 text-cream-muted hover:text-cream transition-colors" title="View detail">
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
                          <button className="p-1.5 rounded-lg hover:bg-jungle/15 text-cream-muted hover:text-jungle-light transition-colors" title="Confirm">
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
                          </div>
                          <div>
                            <p className="text-cream-muted uppercase tracking-wider mb-1">Assigned Vehicle</p>
                            <p className="text-cream font-mono">{b.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-cream-muted uppercase tracking-wider mb-1">WhatsApp</p>
                            <p className="text-cream">{b.whatsapp}</p>
                          </div>
                          <div>
                            <p className="text-cream-muted uppercase tracking-wider mb-1">Booked On</p>
                            <p className="text-cream">{b.created}</p>
                          </div>
                          <div>
                            <p className="text-cream-muted uppercase tracking-wider mb-1">Balance Due</p>
                            <p className={`font-medium ${b.total - b.paid > 0 ? 'text-lava' : 'text-jungle-light'}`}>
                              ${b.total - b.paid > 0 ? b.total - b.paid : '0 — Fully Paid'}
                            </p>
                          </div>
                          <div className="col-span-3 flex items-center gap-2 pt-2">
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

        {filtered.length === 0 && (
          <div className="py-16 text-center text-cream-muted text-sm">No bookings match your search.</div>
        )}
      </div>
    </div>
  )
}
