'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, Wifi, WifiOff, CheckCircle, MapPin, Phone, AlertCircle } from 'lucide-react'

const STATUSES = [
  { id: 'standby',  label: 'Standby',          color: 'text-cream-muted',  bg: 'bg-volcanic-400' },
  { id: 'en-route', label: 'Menuju Pickup',     color: 'text-gold',         bg: 'bg-gold/20' },
  { id: 'arrived',  label: 'Sudah di Lokasi',   color: 'text-jungle-light', bg: 'bg-jungle/20' },
  { id: 'on-trip',  label: 'Trip Berlangsung',  color: 'text-sunset',       bg: 'bg-sunset/20' },
  { id: 'done',     label: 'Trip Selesai',      color: 'text-ocean-light',  bg: 'bg-ocean/20' },
]

export default function DriverPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [status, setStatus]           = useState('standby')

  // Auth guard — redirect to login if no session
  useEffect(() => {
    const raw = localStorage.getItem('driver_session')
    if (!raw) {
      router.replace(`/driver/login`)
    }
  }, [router])
  const [tracking, setTracking]       = useState(false)
  const [connected, setConnected]     = useState(false)
  const [lastSent, setLastSent]       = useState<Date | null>(null)
  const [coords, setCoords]           = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError]             = useState('')
  const [driverName, setDriverName]   = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const sendLocation = async (lat: number, lng: number, currentStatus: string) => {
    try {
      const res = await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode: code, lat, lng, status: currentStatus, driverName }),
      })
      if (res.ok) {
        setConnected(true)
        setLastSent(new Date())
      }
    } catch {
      setConnected(false)
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung GPS.')
      return
    }
    setTracking(true)
    setError('')

    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords
          setCoords({ lat, lng })
          sendLocation(lat, lng, status)
        },
        () => {
          setConnected(false)
          setError('Tidak bisa ambil lokasi. Pastikan GPS aktif.')
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }, 5000)
  }

  const stopTracking = () => {
    setTracking(false)
    setConnected(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    if (coords && tracking) {
      sendLocation(coords.lat, coords.lng, newStatus)
    }
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const currentStatus = STATUSES.find(s => s.id === status)!

  return (
    <div className="min-h-screen bg-volcanic flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/8 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-cream-muted">Driver Panel</p>
          <p className="text-sm font-mono font-bold text-sunset">{code}</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${connected ? 'bg-jungle/20 text-jungle-light' : 'bg-volcanic-400 text-cream-muted'}`}>
          {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5 max-w-sm mx-auto w-full">

        {/* Driver name */}
        {!tracking && (
          <div className="glass-card rounded-2xl p-5">
            <label className="text-xs text-cream-muted block mb-2">Nama driver</label>
            <input
              value={driverName}
              onChange={e => setDriverName(e.target.value)}
              placeholder="Nama kamu..."
              className="input-dark w-full"
            />
          </div>
        )}

        {/* Booking code display */}
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-xs text-cream-muted mb-1">Booking yang sedang dilayani</p>
          <p className="font-mono text-2xl font-bold text-sunset tracking-wider">{code}</p>
        </div>

        {/* GPS coords */}
        {coords && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3"
          >
            <MapPin className="w-4 h-4 text-sunset shrink-0" />
            <div className="text-xs text-cream-muted font-mono">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </div>
            {lastSent && (
              <span className="text-xs text-cream-muted ml-auto">
                {lastSent.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </motion.div>
        )}

        {/* Status selector */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs text-cream-muted mb-3">Status perjalanan</p>
          <div className="space-y-2">
            {STATUSES.map(s => (
              <button
                key={s.id}
                onClick={() => handleStatusChange(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                  status === s.id
                    ? `${s.bg} ${s.color} border-current/30`
                    : 'border-white/8 text-cream-muted hover:border-white/20'
                }`}
              >
                {status === s.id && <CheckCircle className="w-4 h-4 shrink-0" />}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-lava/15 border border-lava/25 text-sm text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start / Stop button */}
        {!tracking ? (
          <button
            onClick={startTracking}
            className="w-full btn-primary justify-center py-4 text-base"
          >
            <Navigation className="w-5 h-5" />
            Mulai Kirim Lokasi
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`w-full flex items-center justify-center gap-3 py-4 rounded-full text-base font-medium ${currentStatus.bg} ${currentStatus.color}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current" />
              </span>
              Live — {currentStatus.label}
            </div>
            <button
              onClick={stopTracking}
              className="w-full btn-ghost justify-center py-3 text-sm"
            >
              Hentikan Tracking
            </button>
          </div>
        )}

        <p className="text-center text-xs text-cream-muted pb-4">
          Lokasi dikirim setiap 5 detik · Jangan tutup halaman ini
        </p>
      </div>
    </div>
  )
}
