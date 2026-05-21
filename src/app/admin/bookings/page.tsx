'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Download, Eye, Check, X, MessageCircle, Loader2,
  UserCheck, Zap, MapPin, AlertTriangle, Navigation, Clock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getPickupCoords, haversineKm } from '@/lib/pickup-times'

interface Booking {
  code: string; name: string; email: string; whatsapp: string
  package: string; pickup: string; pickupAddress: string
  date: string; pickupTime: string; guests: number
  total: number; paid: number; status: string
  country: string; vehicle: string; created: string
  specialRequest: string; paymentMethod: string
  driverName: string | null
}

interface LiveDriver {
  driverName: string; vehicle: string
  lat: number; lng: number; status: string
  tripsToday: number; tripsMonth: number; tripsTotal: number
}

interface AssignModalProps {
  booking: Booking
  drivers: LiveDriver[]
  onAssign: (driverName: string, vehicle: string, dispatch: boolean) => Promise<void>
  onClose: () => void
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
    code: String(b.code || ''), name: String(b.name || ''),
    email: String(b.email || ''), whatsapp: String(b.whatsapp || ''),
    package: String(b.package_title || b.package_id || '—'),
    pickup: String(b.pickup_name || '—'),
    pickupAddress: String(b.pickup_address || ''),
    date: String(b.date || '—'),
    pickupTime: String(b.pickup_time || ''),
    guests: Number(b.guests) || 1, total, paid: derivePaid(status, total),
    status: capitalize(status), country: '🌍', vehicle: 'TBD',
    created: b.created_at ? String(b.created_at).slice(0, 10) : '—',
    specialRequest: String(b.special_request || '—'),
    paymentMethod: String(b.payment_method || '—'),
    driverName: b.driver_name ? String(b.driver_name) : null,
  }
}

const statusStyles: Record<string, string> = {
  Confirmed: 'bg-jungle/15 text-jungle-light border-jungle/25',
  Pending:   'bg-gold/15 text-gold border-gold/25',
  Partial:   'bg-ocean/15 text-ocean-light border-ocean/25',
  Cancelled: 'bg-lava/15 text-lava border-lava/25',
  Assigned:  'bg-ocean/15 text-ocean-light border-ocean/25',
  Dispatched:'bg-sunset/15 text-sunset border-sunset/25',
}

function isTomorrow(dateStr: string): boolean {
  if (!dateStr || dateStr === '—') return false
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dateStr === tomorrow.toISOString().split('T')[0]
}

function isToday(dateStr: string): boolean {
  if (!dateStr || dateStr === '—') return false
  return dateStr === new Date().toISOString().split('T')[0]
}

// ─── Assign Modal ────────────────────────────────────────────────────────────

function AssignModal({ booking, drivers, onAssign, onClose }: AssignModalProps) {
  const [assigning, setAssigning]     = useState(false)
  const [dispatch, setDispatch]       = useState(isToday(booking.date))
  const [selectedDriver, setSelected] = useState<string | null>(null)

  const pickupCoords = getPickupCoords(booking.pickup)

  const driversWithDist = drivers
    .filter(d => ['available', 'standby'].includes(d.status))
    .map(d => ({
      ...d,
      distKm: pickupCoords ? haversineKm(d.lat, d.lng, pickupCoords[0], pickupCoords[1]) : null,
    }))
    .sort((a, b) => {
      if (a.distKm === null && b.distKm === null) return 0
      if (a.distKm === null) return 1
      if (b.distKm === null) return -1
      return a.distKm - b.distKm
    })

  const recommended = driversWithDist[0]

  const handleAssign = async () => {
    const chosen = driversWithDist.find(d => d.driverName === selectedDriver) || recommended
    if (!chosen) return
    setAssigning(true)
    await onAssign(chosen.driverName, chosen.vehicle, dispatch)
    setAssigning(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative glass-card rounded-2xl p-6 w-full max-w-md z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg text-cream">Assign Driver</h2>
            <p className="text-xs text-cream-muted font-mono mt-0.5">{booking.code}</p>
          </div>
          <button onClick={onClose} className="text-cream-muted hover:text-cream">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking summary */}
        <div className="glass-card rounded-xl p-4 mb-5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-cream-muted">Paket</span>
            <span className="text-cream font-medium truncate max-w-[180px]">{booking.package}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream-muted">Tamu</span>
            <span className="text-cream">{booking.name} · {booking.guests} orang</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream-muted">Tanggal</span>
            <span className="text-cream">{booking.date}</span>
          </div>
          {booking.pickupTime && (
            <div className="flex justify-between">
              <span className="text-cream-muted">Jam Jemput</span>
              <span className="text-sunset font-mono font-medium">{booking.pickupTime} WIB</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-cream-muted flex items-center gap-1"><MapPin className="w-3 h-3" />Pickup</span>
            <span className="text-cream truncate max-w-[180px]">{booking.pickup}</span>
          </div>
          {pickupCoords && (
            <p className="text-jungle-light text-[11px]">
              📍 Koordinat pickup terdeteksi — jarak driver dihitung otomatis
            </p>
          )}
        </div>

        {/* Dispatch toggle */}
        <div
          onClick={() => setDispatch(!dispatch)}
          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer mb-5 transition-all ${
            dispatch ? 'border-sunset/40 bg-sunset/8' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div>
            <p className="text-sm font-medium text-cream">
              {dispatch ? '⚡ Dispatch Sekarang' : '📋 Pre-assign Saja'}
            </p>
            <p className="text-xs text-cream-muted">
              {dispatch
                ? 'Driver langsung dapat notif & harus terima/tolak'
                : 'Simpan untuk perencanaan — driver dinotif nanti'}
            </p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors ${dispatch ? 'bg-sunset' : 'bg-volcanic-400'}`}>
            <div className={`w-5 h-5 rounded-full bg-white mt-0.5 transition-transform ${dispatch ? 'translate-x-5.5 ml-0.5' : 'ml-0.5'}`} />
          </div>
        </div>

        {/* Driver list */}
        {driversWithDist.length === 0 ? (
          <div className="text-center py-6 text-cream-muted text-sm">
            Tidak ada driver yang tersedia saat ini.
          </div>
        ) : (
          <div className="space-y-2 mb-5">
            <p className="text-xs text-cream-muted uppercase tracking-wider mb-2">
              {driversWithDist.length} driver tersedia
            </p>
            {driversWithDist.map((d, i) => (
              <div
                key={d.driverName}
                onClick={() => setSelected(d.driverName)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  (selectedDriver === d.driverName || (!selectedDriver && i === 0))
                    ? 'border-sunset/50 bg-sunset/8'
                    : 'border-white/8 hover:border-white/20'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sunset to-gold flex items-center justify-center text-volcanic font-bold text-sm shrink-0">
                  {d.driverName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-cream truncate">{d.driverName}</p>
                    {i === 0 && <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full font-medium shrink-0">⭐ Rekomendasi</span>}
                  </div>
                  <p className="text-xs text-cream-muted font-mono">{d.vehicle}</p>
                </div>
                <div className="text-right shrink-0">
                  {d.distKm !== null ? (
                    <p className="text-xs text-jungle-light font-medium">{d.distKm.toFixed(1)} km</p>
                  ) : (
                    <p className="text-xs text-cream-muted">jarak n/a</p>
                  )}
                  <p className="text-[10px] text-cream-muted">{d.tripsToday} trip hari ini</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAssign}
          disabled={assigning || driversWithDist.length === 0}
          className="btn-primary w-full justify-center py-3"
        >
          {assigning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
          ) : dispatch ? (
            <><Zap className="w-4 h-4" /> Dispatch Driver</>
          ) : (
            <><UserCheck className="w-4 h-4" /> Pre-assign Driver</>
          )}
        </button>
      </motion.div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [bookings, setBookings]       = useState<Booking[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected]       = useState<string | null>(null)
  const [assignTarget, setAssignTarget] = useState<Booking | null>(null)
  const [availDrivers, setAvailDrivers] = useState<LiveDriver[]>([])

  useEffect(() => {
    async function load(silent = false) {
      if (!silent) setLoading(true)
      const { data, error } = await supabase
        .from('bookings').select('*').order('created_at', { ascending: false })
      if (!error && data) setBookings(data.map(mapRow))
      if (!silent) setLoading(false)
    }
    load()
    const interval = setInterval(() => load(true), 10000)
    return () => clearInterval(interval)
  }, [])

  const openAssignModal = async (booking: Booking) => {
    setAssignTarget(booking)
    const res = await fetch('/api/admin/drivers', { cache: 'no-store' })
    const data = await res.json()
    setAvailDrivers(data)
  }

  const handleAssign = async (driverName: string, vehicle: string, dispatch: boolean) => {
    if (!assignTarget) return
    await fetch('/api/admin/assign-driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingCode: assignTarget.code,
        driverName, vehicle, dispatch,
      }),
    })
    setAssignTarget(null)
    // Refresh list
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
    if (data) setBookings(data.map(mapRow))
  }

  const statuses = ['All', 'Confirmed', 'Pending', 'Assigned', 'Dispatched', 'Partial', 'Cancelled']

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.package.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered.reduce((sum, b) => sum + b.paid, 0)
  const totalGuests  = filtered.reduce((sum, b) => sum + b.guests, 0)
  const tomorrowUnassigned = bookings.filter(b => isTomorrow(b.date) && !b.driverName && b.status !== 'Cancelled').length

  return (
    <div className="space-y-6">
      {/* Assign modal */}
      {assignTarget && (
        <AssignModal
          booking={assignTarget}
          drivers={availDrivers}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}

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
              {bookings.length} total · {bookings.filter(b => b.status === 'Confirmed').length} confirmed
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tomorrowUnassigned > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lava/15 border border-lava/30 text-xs text-lava font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {tomorrowUnassigned} trip besok belum assign
            </div>
          )}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-cream-muted hover:text-cream hover:border-sunset/30 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en-US')}`, sub: 'from filtered' },
          { label: 'Filtered Bookings', value: filtered.length, sub: `of ${bookings.length} total` },
          { label: 'Total Travelers', value: totalGuests, sub: 'guests in selection' },
          { label: 'Avg Booking Value', value: filtered.length ? `$${Math.round(totalRevenue / filtered.length)}` : '$0', sub: 'per booking' },
        ].map(c => (
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
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, code, package..."
            className="input-dark pl-9 text-sm py-2.5 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                statusFilter === s ? 'bg-sunset/20 text-sunset border-sunset/30' : 'text-cream-muted border-white/10 hover:border-sunset/20'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6">
                {['Booking Code', 'Traveler', 'Package', 'Departure', 'Jam', 'Guests', 'Total', 'Driver', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-cream-muted uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} className="py-16 text-center text-cream-muted">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading bookings...
                </td></tr>
              )}
              {!loading && filtered.map(b => (
                <>
                  <tr
                    key={b.code}
                    className={`border-b border-white/3 hover:bg-white/2 cursor-pointer transition-colors ${selected === b.code ? 'bg-sunset/5' : ''} ${isTomorrow(b.date) && !b.driverName ? 'border-l-2 border-l-lava/60' : ''}`}
                    onClick={() => setSelected(selected === b.code ? null : b.code)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-cream-muted">{b.code}</div>
                      {isTomorrow(b.date) && !b.driverName && (
                        <div className="text-[10px] text-lava flex items-center gap-0.5 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Besok, belum assign
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-cream font-medium">{b.name}</div>
                      <div className="text-cream-muted mt-0.5">{b.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-cream max-w-[160px] truncate">{b.package}</td>
                    <td className="py-3.5 px-4 text-cream-muted">{b.date}</td>
                    <td className="py-3.5 px-4 font-mono text-sunset text-xs">{b.pickupTime || '—'}</td>
                    <td className="py-3.5 px-4 text-cream text-center">{b.guests}</td>
                    <td className="py-3.5 px-4 text-cream font-medium">
                      {Number(b.total) > 0 ? `$${b.total}` : <span className="text-cream-muted">TBD</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.driverName
                        ? <span className="text-jungle-light text-xs">{b.driverName}</span>
                        : <span className="text-cream-muted text-xs">—</span>
                      }
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full border font-medium ${statusStyles[b.status] || 'bg-white/8 text-cream-muted border-white/10'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={e => { e.stopPropagation(); openAssignModal(b) }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            b.driverName
                              ? 'hover:bg-ocean/15 text-cream-muted hover:text-ocean-light'
                              : 'hover:bg-jungle/15 text-cream-muted hover:text-jungle-light'
                          }`}
                          title={b.driverName ? 'Ganti driver' : 'Assign driver'}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        {b.status === 'Assigned' && (
                          <button
                            onClick={async e => {
                              e.stopPropagation()
                              await fetch('/api/admin/assign-driver', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ bookingCode: b.code, driverName: b.driverName, dispatch: true }),
                              })
                              const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
                              if (data) setBookings(data.map(mapRow))
                            }}
                            className="p-1.5 rounded-lg hover:bg-sunset/15 text-cream-muted hover:text-sunset transition-colors"
                            title="Dispatch sekarang"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}?text=Hi ${b.name.split(' ')[0]}, this is Rehan Tour regarding your booking ${b.code}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-wa/10 text-cream-muted hover:text-wa transition-colors"
                          title="WhatsApp" onClick={e => e.stopPropagation()}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {selected === b.code && (
                    <tr key={`${b.code}-expanded`} className="bg-sunset/3">
                      <td colSpan={10} className="px-4 py-4">
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs"
                        >
                          <div>
                            <p className="text-cream-muted uppercase tracking-wider mb-1">Pickup Point</p>
                            <p className="text-cream">{b.pickup}</p>
                            {b.pickupAddress && <p className="text-cream-muted mt-0.5 text-[11px]">{b.pickupAddress}</p>}
                          </div>
                          <div>
                            <p className="text-cream-muted uppercase tracking-wider mb-1">Jam Jemput</p>
                            <p className="text-sunset font-mono font-medium">{b.pickupTime || '—'}</p>
                          </div>
                          <div>
                            <p className="text-cream-muted uppercase tracking-wider mb-1">Driver Assigned</p>
                            <p className="text-cream">{b.driverName || 'Belum di-assign'}</p>
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
                            <p className={`font-medium ${b.total - b.paid > 0 ? 'text-lava' : 'text-jungle-light'}`}>
                              ${b.total - b.paid > 0 ? b.total - b.paid : '0 — Fully Paid'}
                            </p>
                          </div>
                          <div className="col-span-4 flex items-center gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => openAssignModal(b)}
                              className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              {b.driverName ? 'Ganti Driver' : 'Assign Driver'}
                            </button>
                            <button className="btn-ghost text-xs py-1.5 px-4">Send Reminder</button>
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
            {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your search.'}
          </div>
        )}
      </div>
    </div>
  )
}
