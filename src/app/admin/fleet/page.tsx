'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Truck, MapPin, Phone, CheckCircle, AlertCircle,
  Clock, Wrench, Navigation, Users, RefreshCw, ExternalLink, Copy, Check as CheckIcon, Calendar,
  Plus, Trash2,
} from 'lucide-react'
import { getPusherClient } from '@/lib/pusher-client'
import 'leaflet/dist/leaflet.css'

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
  const [view, setView]                 = useState<'map' | 'list' | 'schedule' | 'armada' | 'pendaftaran'>('map')
  const [lastRefresh, setLastRefresh]   = useState(new Date())
  const [copied, setCopied]             = useState(false)
  const [schedule, setSchedule]         = useState<Record<string, Array<{
    code: string; packageTitle: string; date: string
    pickupTime: string; guests: number; status: string; customerName: string
  }>>>({})
  const [vehicles, setVehicles] = useState<Array<{
    id: string; name: string; type: string; plate: string
    capacity: number; status: string; notes: string | null
  }>>([])
  const [pendingDrivers, setPendingDrivers] = useState<Array<{
    id: string; username: string; name: string; phone: string
    vehicle_type: string | null; status: string; created_at: string
  }>>([])
  const [vehicleForm, setVehicleForm] = useState({ name: '', type: '', plate: '', capacity: 4, notes: '' })
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => {
    if (view !== 'schedule') return
    const controller = new AbortController()
    fetch('/api/admin/driver-schedule', { cache: 'no-store', signal: controller.signal })
      .then(r => r.json()).then(setSchedule).catch(() => {})
    return () => controller.abort()
  }, [view])

  useEffect(() => {
    if (view === 'armada') {
      fetch('/api/admin/vehicles').then(r => r.json()).then(d => setVehicles(d.vehicles || []))
    }
    if (view === 'pendaftaran') {
      fetch('/api/admin/driver-approval').then(r => r.json()).then(d => setPendingDrivers(d.drivers || []))
    }
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
      const res = await fetch('/api/admin/drivers')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setLiveDrivers(Array.isArray(data) ? data : [])
      setLastRefresh(new Date())
    } catch {}
  }

  useEffect(() => {
    fetchLive()
    const interval = setInterval(fetchLive, 5000)
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
        const base = idx >= 0 ? prev[idx] : {} as LiveDriver
        const merged: LiveDriver = {
          ...base,
          driverName:  String(raw.driverName || base.driverName || ''),
          vehicle:     String(raw.vehicle     || base.vehicle     || ''),
          lat:         Number(raw.lat  ?? base.lat  ?? 0),
          lng:         Number(raw.lng  ?? base.lng  ?? 0),
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
        // Driver baru muncul lewat Pusher — refresh API untuk dapat trip counts
        fetchLive()
        return [...prev, merged]
      })
    })
    return () => { ch?.unbind_all(); client?.unsubscribe('admin-drivers') }
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
            {(
              [['map', 'Peta Live'], ['list', 'Daftar'], ['schedule', 'Jadwal'], ['armada', 'Armada'], ['pendaftaran', 'Pendaftaran']] as [string, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v as 'map' | 'list' | 'schedule' | 'armada' | 'pendaftaran')}
                className={`px-4 py-2 text-xs font-medium transition-all relative ${view === v ? 'bg-sunset text-volcanic' : 'text-cream-muted hover:text-cream'}`}
              >
                {label}
                {v === 'pendaftaran' && pendingDrivers.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lava text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingDrivers.length > 9 ? '9+' : pendingDrivers.length}
                  </span>
                )}
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

      {view === 'map' && (
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
            <AdminDriverMap initialDrivers={liveDrivers} />
          </div>
        </div>
      )}

      {view === 'list' && (
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
                    key={`${d.driverName}-${d.vehicle}`}
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

      {view === 'armada' && (
        <div className="space-y-4">
          {/* Header + Add button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-cream-muted">{vehicles.length} kendaraan terdaftar</p>
            <button
              onClick={() => setShowVehicleForm(!showVehicleForm)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Kendaraan
            </button>
          </div>

          {/* Add vehicle form (collapsible) */}
          {showVehicleForm && (
            <div className="glass-card rounded-2xl p-5 space-y-4 border-sunset/20">
              <h3 className="text-sm font-medium text-cream">Tambah Kendaraan Baru</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Nama Kendaraan</label>
                  <input value={vehicleForm.name} onChange={e => setVehicleForm(f => ({...f, name: e.target.value}))}
                    placeholder="Toyota HiAce 1" className="input-dark w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tipe</label>
                  <select value={vehicleForm.type} onChange={e => setVehicleForm(f => ({...f, type: e.target.value}))}
                    className="input-dark w-full text-sm appearance-none">
                    <option value="">Pilih tipe...</option>
                    {['Avanza','Innova','Innova Reborn','HiAce','L300','Elf','Bus Pariwisata'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Nomor Plat</label>
                  <input value={vehicleForm.plate} onChange={e => setVehicleForm(f => ({...f, plate: e.target.value.toUpperCase()}))}
                    placeholder="W 1234 AB" className="input-dark w-full text-sm font-mono tracking-widest" />
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Kapasitas (orang)</label>
                  <input type="number" min={1} max={50} value={vehicleForm.capacity}
                    onChange={e => setVehicleForm(f => ({...f, capacity: Number(e.target.value)}))}
                    className="input-dark w-full text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Catatan (opsional)</label>
                <input value={vehicleForm.notes} onChange={e => setVehicleForm(f => ({...f, notes: e.target.value}))}
                  placeholder="Warna putih, AC double blower..." className="input-dark w-full text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  if (!vehicleForm.name || !vehicleForm.type || !vehicleForm.plate) return
                  setSavingVehicle(true)
                  try {
                    const res = await fetch('/api/admin/vehicles', {
                      method: 'POST', headers: {'Content-Type':'application/json'},
                      body: JSON.stringify(vehicleForm)
                    })
                    const d = await res.json()
                    if (d.vehicle) {
                      setVehicles(prev => [d.vehicle, ...prev])
                      setVehicleForm({ name:'', type:'', plate:'', capacity:4, notes:'' })
                      setShowVehicleForm(false)
                    }
                  } finally { setSavingVehicle(false) }
                }} disabled={savingVehicle} className="btn-primary text-xs px-4 py-2">
                  {savingVehicle ? 'Menyimpan...' : 'Simpan Kendaraan'}
                </button>
                <button onClick={() => setShowVehicleForm(false)}
                  className="border border-white/10 text-cream-muted hover:text-cream rounded-xl px-4 py-2 transition-colors text-xs">
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Vehicle cards grid */}
          {vehicles.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-cream-muted text-sm">
              Belum ada kendaraan. Klik &quot;Tambah Kendaraan&quot; untuk mendaftarkan armada.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="glass-card rounded-2xl overflow-hidden">
                  <div className={`px-4 py-2.5 flex items-center justify-between border-b border-white/5 ${
                    v.status === 'available' ? 'bg-jungle/10' : v.status === 'on_trip' ? 'bg-sunset/10' : 'bg-white/5'
                  }`}>
                    <span className={`text-xs font-medium ${
                      v.status === 'available' ? 'text-jungle-light' : v.status === 'on_trip' ? 'text-sunset' : 'text-cream-muted'
                    }`}>
                      {v.status === 'available' ? '● Tersedia' : v.status === 'on_trip' ? '● On Trip' : '● Maintenance'}
                    </span>
                    <span className="font-mono text-xs text-cream-muted">{v.plate}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-cream mb-0.5">{v.name}</p>
                    <p className="text-xs text-cream-muted mb-3">{v.type} · Maks {v.capacity} penumpang</p>
                    {v.notes && <p className="text-[11px] text-cream-muted mb-3 italic">{v.notes}</p>}
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        const newStatus = v.status === 'available' ? 'maintenance' : 'available'
                        await fetch('/api/admin/vehicles', {
                          method: 'PATCH', headers:{'Content-Type':'application/json'},
                          body: JSON.stringify({ id: v.id, status: newStatus })
                        })
                        setVehicles(prev => prev.map(x => x.id === v.id ? {...x, status: newStatus} : x))
                      }} className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-cream-muted hover:text-cream hover:border-white/25 transition-colors">
                        {v.status === 'available' ? 'Set Maintenance' : 'Set Tersedia'}
                      </button>
                      {v.status === 'available' && (
                        <button onClick={async () => {
                          if (!confirm(`Hapus ${v.name}?`)) return
                          const res = await fetch('/api/admin/vehicles', {
                            method: 'DELETE', headers:{'Content-Type':'application/json'},
                            body: JSON.stringify({ id: v.id })
                          })
                          const d = await res.json()
                          if (d.ok) setVehicles(prev => prev.filter(x => x.id !== v.id))
                          else alert(d.error || 'Gagal hapus')
                        }} className="p-1.5 rounded-lg border border-lava/20 text-lava/60 hover:text-lava hover:border-lava/40 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'pendaftaran' && (
        <div className="space-y-4">
          <p className="text-sm text-cream-muted">{pendingDrivers.length} pendaftaran menunggu review</p>
          {pendingDrivers.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-cream-muted text-sm">
              Tidak ada pendaftaran driver baru.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDrivers.map(d => (
                <div key={d.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sunset/60 to-gold/60 flex items-center justify-center text-volcanic font-bold text-sm shrink-0">
                        {d.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cream">{d.name}</p>
                        <p className="text-xs text-cream-muted font-mono">@{d.username}</p>
                        {d.phone && <p className="text-xs text-jungle-light">{d.phone}</p>}
                        <p className="text-[11px] text-cream-muted mt-0.5">
                          Daftar: {new Date(d.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={approvingId === d.id}
                        onClick={async () => {
                          setApprovingId(d.id)
                          try {
                            const res = await fetch('/api/admin/driver-approval', {
                              method: 'PATCH', headers:{'Content-Type':'application/json'},
                              body: JSON.stringify({ driverId: d.id, action: 'reject' })
                            })
                            const data = await res.json()
                            if (data.ok) setPendingDrivers(prev => prev.filter(x => x.id !== d.id))
                            else alert(data.error || 'Gagal reject')
                          } finally { setApprovingId(null) }
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl border border-lava/30 text-lava hover:bg-lava/10 transition-colors disabled:opacity-50"
                      >
                        Tolak
                      </button>
                      <button
                        disabled={approvingId === d.id}
                        onClick={async () => {
                          setApprovingId(d.id)
                          try {
                            const res = await fetch('/api/admin/driver-approval', {
                              method: 'PATCH', headers:{'Content-Type':'application/json'},
                              body: JSON.stringify({ driverId: d.id, action: 'approve' })
                            })
                            const data = await res.json()
                            if (data.ok) setPendingDrivers(prev => prev.filter(x => x.id !== d.id))
                            else alert(data.error || 'Gagal approve')
                          } finally { setApprovingId(null) }
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl bg-jungle/20 border border-jungle/30 text-jungle-light hover:bg-jungle/30 transition-colors disabled:opacity-50"
                      >
                        {approvingId === d.id ? 'Proses...' : 'Setujui'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <div key={`${d.driverName}-${d.vehicle}`} className="flex items-center gap-4 px-5 py-3">
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
