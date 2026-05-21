'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Navigation, Phone, Users, Clock, CheckCircle, AlertCircle, Truck } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const AdminDriverMap = dynamic(() => import('@/components/ui/admin-driver-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl">
      <span className="text-gray-400">Memuat peta...</span>
    </div>
  ),
})

interface DriverState {
  driverName: string
  vehicle: string
  lat: number
  lng: number
  status: string
  bookingCode: string | null
  customerName: string | null
  pickupName: string | null
  updatedAt: number
}

const STATUS_COLORS: Record<string, string> = {
  available:  'text-jungle-light bg-jungle/15 border-jungle/30',
  standby:    'text-gold bg-gold/15 border-gold/30',
  'en-route': 'text-sunset bg-sunset/15 border-sunset/30',
  arrived:    'text-purple-300 bg-purple-900/20 border-purple-500/30',
  'on-trip':  'text-red-300 bg-red-900/20 border-red-500/30',
  offline:    'text-cream-muted bg-volcanic-400 border-white/8',
}

const STATUS_LABELS: Record<string, string> = {
  available:  'Tersedia',
  standby:    'Standby',
  confirmed:  'Terima Order',
  'en-route': 'Menuju Jemput',
  arrived:    'Di Lokasi',
  'on-trip':  'Sedang Trip',
  completed:  'Selesai',
  offline:    'Offline',
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverState[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/admin/drivers')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setDrivers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('fetchDrivers failed', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
    const interval = setInterval(fetchDrivers, 10000)
    return () => clearInterval(interval)
  }, [])

  const available = drivers.filter(d => d.status === 'available' || d.status === 'standby')
  const onDuty    = drivers.filter(d => !['available', 'standby', 'offline'].includes(d.status))
  const offline   = drivers.filter(d => d.status === 'offline')

  return (
    <div className="min-h-screen bg-volcanic">
      {/* Header */}
      <div className="glass border-b border-white/8 px-6 py-4">
        <div className="max-w-container mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-cream">Live Driver Tracking</h1>
            <p className="text-xs text-cream-muted mt-0.5">
              {drivers.length} driver terdaftar · diperbarui tiap 10 detik
            </p>
          </div>
          <Link href="/admin" className="btn-ghost text-sm px-4 py-2">← Admin</Link>
        </div>
      </div>

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

          {/* Left panel — driver list */}
          <div className="space-y-4 overflow-y-auto">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tersedia', count: available.length, icon: CheckCircle, color: 'text-jungle-light' },
                { label: 'Bertugas', count: onDuty.length,    icon: Navigation,   color: 'text-sunset' },
                { label: 'Offline',  count: offline.length,   icon: AlertCircle,  color: 'text-cream-muted' },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                  <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                  <p className={`text-2xl font-bold font-display ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-cream-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Driver cards */}
            {loading && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-cream-muted text-sm">Memuat data driver...</p>
              </div>
            )}

            {!loading && drivers.length === 0 && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <Truck className="w-8 h-8 text-cream-muted mx-auto mb-2" />
                <p className="text-cream-muted text-sm">Belum ada driver aktif.</p>
                <p className="text-xs text-cream-muted mt-1">Driver akan muncul saat mereka login dan kirim lokasi.</p>
              </div>
            )}

            {drivers.map(driver => (
              <div key={`${driver.driverName}-${driver.vehicle}`} className="glass-card rounded-2xl p-5 hover:border-sunset/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sunset/80 to-gold/80 flex items-center justify-center text-volcanic font-bold font-display shrink-0">
                      {driver.driverName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cream">{driver.driverName}</p>
                      <p className="text-xs text-cream-muted font-mono">{driver.vehicle}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[driver.status] || STATUS_COLORS.offline}`}>
                    {STATUS_LABELS[driver.status] || driver.status}
                  </span>
                </div>

                {driver.bookingCode && (
                  <div className="space-y-1.5 text-xs text-cream-muted border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3 h-3 text-sunset shrink-0" />
                      <span className="font-mono text-cream">{driver.bookingCode}</span>
                    </div>
                    {driver.pickupName && (
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">→</span>
                        <span className="line-clamp-1">{driver.pickupName}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-cream-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(driver.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {driver.bookingCode && (
                    <Link
                      href={`/booking/${driver.bookingCode}`}
                      className="text-xs text-sunset hover:text-sunset-light transition-colors"
                      target="_blank"
                    >
                      Lihat tracker →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right — full map */}
          <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
            <AdminDriverMap initialDrivers={drivers} />
          </div>
        </div>
      </div>
    </div>
  )
}
