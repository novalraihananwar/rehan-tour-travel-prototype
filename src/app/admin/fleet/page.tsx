'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Truck, MapPin, Phone, CheckCircle, AlertCircle,
  Clock, Wrench, Navigation, Users, RefreshCw, ExternalLink, Copy, Check as CheckIcon, Calendar,
} from 'lucide-react'
import { getPusherClient } from '@/lib/pusher-client'

const AdminDriverMap = dynamic(() => import('@/components/ui/admin-driver-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <span className="text-gray-400 text-sm">Memuat peta...</span>
    </div>
  ),
})

interface LiveDriver {
  driverName:  string
  vehicle:     string
  lat:         number
  lng:         number
  status:      string
  bookingCode: string | null
  customerName: string | null
  pickupName:  string | null
  pickupLat:   number | null
  pickupLng:   number | null
  updatedAt:   number
  tripsToday:  number
  tripsMonth:  number
  tripsTotal:  number
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  available:         { label: 'Tersedia',          dot: 'bg-jungle-light', text: 'text-jungle-light', bg: 'bg-jungle/15',      border: 'border-jungle/25' },
  standby:           { label: 'Standby',            dot: 'bg-gold',         text: 'text-gold',         bg: 'bg-gold/15',        border: 'border-gold/25' },
  'en-route':        { label: 'Menuju Pickup',      dot: 'bg-sunset',       text: 'text-sunset',       bg: 'bg-sunset/15',      border: 'border-sunset/25' },
  'on-trip':         { label: 'Sedang Trip',        dot: 'bg-lava',         text: 'text-lava',         bg: 'bg-lava/15',        border: 'border-lava/25' },
  arrived:           { label: 'Di Lokasi',          dot: 'bg-purple-400',   text: 'text-purple-300',   bg: 'bg-purple-900/20',  border: 'border-purple-500/30' },
  confirmed:         { label: 'Terima Orderan',     dot: 'bg-ocean-light',  text: 'text-ocean-light',  bg: 'bg-ocean/15',       border: 'border-ocean/25' },
  'vehicle-problem': { label: '⚠ Kendaraan Masalah', dot: 'bg-gold',        text: 'text-gold',         bg: 'bg-gold/20',        border: 'border-gold/40' },
  service:           { label: '🔧 Service',          dot: 'bg-cream-muted',  text: 'text-cream-muted',  bg: 'bg-white/8',        border: 'border-white/15' },
  accident:          { label: '🚨 Darurat',          dot: 'bg-lava',         text: 'text-lava',         bg: 'bg-lava/25',        border: 'border-lava/50' },
  offline:           { label: 'Offline',             dot: 'bg-cream-muted',  text: 'text-cream-muted',  bg: 'bg-white/5',        border: 'border-white/8' },
}

export default function FleetPage() {
  const [liveDrivers, setLiveDrivers]   = useState<LiveDriver[]>([])
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQ, setSearchQ]           = useState('')
  const [view, setView]                 = useState<'map' | 'list' | 'schedule'>('map')
  const [lastRefresh, setLastRefresh]   = useState(new Date())
  const [copied, setCopied]             = useState(false)
  const [schedule, setSchedule]         = useState<Record<string, Array<{
    code: string; packageTitle: string; date: string
    pickupTime: string; guests: number; status: string; customerName: string
  }>>>({})

  useEffect(() => {
    if (view !== 'schedule') return
    fetch('/api/admin/driver-schedule', { cache: 'no-store' })
      .then(r => r.json()).then(setSchedule).catch(() => {})
  }, [view])

  const driverLoginUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/driver/login`
    : '/driver/login'

  const copyDriverLink = () => {
    navigator.clipboard.writeText(driverLoginUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fetch live drivers
  const fetchLive = async () => {
    try {
      const res  = await fetch('/api/admin/drivers')
      const data = await res.json()
      setLiveDrivers(data)
      setLastRefresh(new Date())
    } catch {}
  }

  useEffect(() => {
    fetchLive()
    const interval = setInterval(fetchLive, 10000)
    return () => clearInterval(interval)
  }, [])

  // Pusher real-time
  useEffect(() => {
    let client: ReturnType<typeof getPusherClient>
    try { client = getPusherClient() } catch { return }
    const ch = client.subscribe('admin-drivers')
    ch.bind('driver-update', (raw: Record<string, unknown>) => {
      setLiveDrivers(prev => {
        const idx = prev.findIndex(d => d.driverName === raw.driverName)
        // Merge: keep existing trip counts, update position/status from Pusher
        const base = idx >= 0 ? prev[idx] : {} as LiveDriver
        const merged: LiveDriver = {
          ...base,
          driverName:  String(raw.driverName || base.driverName || ''),
          vehicle:     String(raw.vehicle     || base.vehicle     || ''),
          lat:         Number(raw.lat  ?? base.lat),
          lng:         Number(raw.lng  ?? base.lng),
          status:      String(raw.status      || base.status      || 'available'),
          bookingCode: (raw.bookingCode as string | null) ?? base.bookingCode ?? null,
          customerName: base.customerName ?? null,
          pickupName:   base.pickupName   ?? null,
          pickupLat:    base.pickupLat    ?? null,
          pickupLng:    base.pickupLng    ?? null,
          updatedAt:   Number(raw.timestamp   || raw.updatedAt || Date.now()),
          tripsToday:  base.tripsToday  ?? 0,
          tripsMonth:  base.tripsMonth  ?? 0,
          tripsTotal:  base.tripsTotal  ?? 0,
        }
        if (idx >= 0) { const n = [...prev]; n[idx] = merged; return n }
        return [...prev, merged]
      })
    })
    return () => { ch.unbind_all(); client.unsubscribe('admin-drivers') }
  }, [])

  const statuses = ['All', 'available', 'standby', 'on-trip', 'en-route', 'arrived', 'vehicle-problem', 'service', 'accident', 'offline']

  const filteredDrivers = liveDrivers.filter(d => {
    const matchStatus = filterStatus === 'All' || d.status === filterStatus
    const matchSearch = !searchQ ||
      d.driverName.toLowerCase().includes(searchQ.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(searchQ.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    available: liveDrivers.filter(d => d.status === 'available').length,
    onTrip:    liveDrivers.filter(d => ['on-trip', 'en-route', 'arrived', 'confirmed'].includes(d.status)).length,
    standby:   liveDrivers.filter(d => d.status === 'standby').length,
    problem:   liveDrivers.filter(d => ['vehicle-problem', 'service', 'accident'].includes(d.status)).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Fleet & Drivers</h1>
          <p className="text-sm text-cream-muted mt-0.5">
            {liveDrivers.length} driver online · real-time dari Supabase
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Driver portal shortcut */}
          <a
            href="/driver/login"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-jungle/30 bg-jungle/10 text-jungle-light text-xs font-medium hover:bg-jungle/20 transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            Driver Portal
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <button onClick={fetchLive} className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {([['map', 'Peta Live'], ['list', 'Daftar'], ['schedule', 'Jadwal']] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-medium transition-all ${view === v ? 'bg-sunset text-volcanic' : 'text-cream-muted hover:text-cream'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tersedia', count: counts.available, color: 'text-jungle-light', icon: CheckCircle },
          { label: 'On Trip',  count: counts.onTrip,   color: 'text-sunset',       icon: Navigation },
          { label: 'Standby',  count: counts.standby,  color: 'text-gold',         icon: Clock },
          { label: 'Masalah',  count: counts.problem,  color: 'text-lava',         icon: Wrench },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
            <p className={`text-xl font-bold font-display ${s.color}`}>{s.count}</p>
            <p className="text-xs text-cream-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Driver login link card */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border-jungle/15">
        <div className="w-9 h-9 rounded-xl bg-jungle/15 flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4 text-jungle-light" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-cream mb-0.5">Link Login Driver</p>
          <p className="text-xs text-cream-muted font-mono truncate">{driverLoginUrl}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyDriverLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-cream-muted hover:text-cream hover:border-white/25 transition-colors"
          >
            {copied ? <CheckIcon className="w-3.5 h-3.5 text-jungle-light" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Copy'}
          </button>
          <a
            href="/driver/login"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-jungle/15 border border-jungle/25 text-xs text-jungle-light hover:bg-jungle/25 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka
          </a>
        </div>
      </div>

      {view === 'map' ? (
        /* MAP VIEW — live driver positions */
        <div className="glass-card rounded-2xl overflow-hidden" style={{ height: '520px' }}>
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-jungle-light animate-pulse" />
              <span className="text-sm font-medium text-cream">Live Driver Map</span>
              <span className="text-xs text-cream-muted">
                · {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <span className="text-xs text-cream-muted">{liveDrivers.length} driver online</span>
          </div>
          <div style={{ height: 'calc(100% - 48px)' }}>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <AdminDriverMap initialDrivers={liveDrivers} />
          </div>
        </div>
      ) : (
        /* LIST VIEW — all fleet vehicles */
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Cari driver atau ID kendaraan..."
              className="input-dark text-sm py-2 w-56"
            />
            <div className="flex gap-1.5 flex-wrap">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    filterStatus === s
                      ? 'bg-gradient-to-r from-sunset to-gold text-volcanic border-transparent'
                      : 'border-white/10 text-cream-muted hover:border-white/25'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-cream-muted">{filteredDrivers.length} driver online</p>

          {filteredDrivers.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-cream-muted text-sm">
              {liveDrivers.length === 0
                ? 'Belum ada driver online. Driver yang aktif GPS akan muncul di sini.'
                : 'Tidak ada driver yang cocok dengan filter.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDrivers.map((d, i) => {
                const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.offline
                const isActive = ['on-trip', 'en-route', 'arrived'].includes(d.status)
                return (
                  <motion.div
                    key={d.driverName}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl overflow-hidden hover:border-sunset/20 transition-all"
                  >
                    <div className={`px-4 py-2.5 flex items-center justify-between border-b border-white/5 ${cfg.bg}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
                        <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-cream-muted">{d.vehicle}</span>
                        <span className="text-xs text-jungle-light bg-jungle/20 px-1.5 py-0.5 rounded-full">GPS</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-volcanic-400 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4 text-cream-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-cream truncate">{d.driverName}</p>
                          <p className="text-xs text-cream-muted">
                            Updated {new Date(d.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-cream-muted mb-3">
                        <div className="flex items-center gap-1 text-jungle-light">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</span>
                        </div>
                        {d.bookingCode && d.bookingCode !== 'STANDBY' && (
                          <div className="flex items-center gap-1 text-sunset">
                            <Navigation className="w-3 h-3 shrink-0" />
                            <span className="truncate">{d.bookingCode}</span>
                          </div>
                        )}
                        {d.pickupName && (
                          <div className="flex justify-between">
                            <span>Pickup</span>
                            <span className="text-cream truncate max-w-[100px]">{d.pickupName}</span>
                          </div>
                        )}
                        {/* Trip counts */}
                        <div className="pt-2 mt-2 border-t border-white/6 grid grid-cols-3 gap-1 text-center">
                          <div>
                            <p className="text-cream font-bold text-sm">{d.tripsToday ?? 0}</p>
                            <p className="text-[10px]">Hari ini</p>
                          </div>
                          <div>
                            <p className="text-cream font-bold text-sm">{d.tripsMonth ?? 0}</p>
                            <p className="text-[10px]">Bulan ini</p>
                          </div>
                          <div>
                            <p className="text-sunset font-bold text-sm">{d.tripsTotal ?? 0}</p>
                            <p className="text-[10px]">Total</p>
                          </div>
                        </div>
                      </div>

                      {d.bookingCode && d.bookingCode !== 'STANDBY' && (
                        <Link
                          href={`/booking/${d.bookingCode}`}
                          target="_blank"
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-sunset/25 bg-sunset/10 text-sunset text-xs hover:bg-sunset/20 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Track Booking
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedule view */}
      {view === 'schedule' && (
        <div className="space-y-4">
          {Object.keys(schedule).length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-cream-muted text-sm">
              Belum ada driver yang di-assign ke booking apapun.
            </div>
          ) : (
            Object.entries(schedule).map(([driverName, trips]) => (
              <div key={driverName} className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sunset to-gold flex items-center justify-center text-volcanic font-bold text-sm shrink-0">
                    {driverName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{driverName}</p>
                    <p className="text-xs text-cream-muted">{trips.length} booking terjadwal</p>
                  </div>
                </div>
                <div className="divide-y divide-white/4">
                  {trips.map(t => {
                    const statusColor = t.status === 'confirmed' ? 'text-jungle-light'
                      : t.status === 'dispatched' ? 'text-sunset'
                      : 'text-gold'
                    return (
                      <div key={t.code} className="px-5 py-3 flex items-center gap-4 hover:bg-white/2 transition-colors">
                        <div className="w-16 text-center shrink-0">
                          <p className="text-xs font-bold text-cream">{t.date?.slice(5)}</p>
                          <p className="text-[10px] text-sunset font-mono">{t.pickupTime || '—'}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-cream truncate">{t.packageTitle}</p>
                          <p className="text-[11px] text-cream-muted">{t.customerName} · {t.guests} tamu</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[11px] font-medium capitalize ${statusColor}`}>{t.status}</p>
                          <p className="text-[10px] text-cream-muted font-mono">{t.code}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Live drivers detail (shown below map) */}
      {view === 'map' && liveDrivers.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-medium text-cream flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sunset" />
              Driver Online Saat Ini
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {liveDrivers.map(d => {
              const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.offline
              return (
                <div key={d.driverName} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sunset/80 to-gold/80 flex items-center justify-center text-volcanic font-bold text-sm shrink-0">
                    {d.driverName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cream">{d.driverName}</p>
                    <p className="text-xs text-cream-muted font-mono">{d.vehicle} · {d.lat.toFixed(4)}, {d.lng.toFixed(4)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                  {d.bookingCode && (
                    <Link href={`/booking/${d.bookingCode}`} target="_blank" className="text-xs text-sunset hover:text-gold transition-colors">
                      {d.bookingCode}
                    </Link>
                  )}
                  <span className="text-xs text-cream-muted">
                    {new Date(d.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'map' && liveDrivers.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Truck className="w-8 h-8 text-cream-muted mx-auto mb-2" />
          <p className="text-cream-muted text-sm">Belum ada driver yang online.</p>
          <p className="text-xs text-cream-muted mt-1">Driver akan muncul di peta saat mereka login dan GPS aktif.</p>
        </div>
      )}
    </div>
  )
}
