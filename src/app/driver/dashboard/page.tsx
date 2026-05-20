'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, LogOut, Truck, ArrowRight, Search, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

interface DriverSession {
  username: string
  name: string
  vehicle: string
  loginAt: number
}

type GpsStatus = 'checking' | 'required' | 'granted' | 'denied'

export default function DriverDashboard() {
  const router = useRouter()
  const [session, setSession]         = useState<DriverSession | null>(null)
  const [bookingCode, setBookingCode] = useState('')
  const [error, setError]             = useState('')
  const [gpsStatus, setGpsStatus]     = useState<GpsStatus>('checking')
  const [gpsCoords, setGpsCoords]     = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('driver_session')
    if (!raw) {
      router.replace('/driver/login')
      return
    }
    const data: DriverSession = JSON.parse(raw)
    // Session expires after 12 hours
    if (Date.now() - data.loginAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem('driver_session')
      router.replace('/driver/login')
      return
    }
    setSession(data)

    // Check GPS permission immediately after session loaded
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
              setGpsStatus('granted')
            },
            () => setGpsStatus('required')
          )
        } else {
          setGpsStatus('required')
        }
      })
    } else {
      setGpsStatus('required')
    }
  }, [router])

  const requestGps = () => {
    setGpsStatus('checking')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setGpsCoords(coords)
        setGpsStatus('granted')
        // Start broadcasting immediately as "standby" so admin can see driver
        startStandbyBroadcast(coords)
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const standbyIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startStandbyBroadcast = (initialCoords: { lat: number; lng: number }) => {
    if (standbyIntervalRef.current) clearInterval(standbyIntervalRef.current)

    const broadcast = (coords: { lat: number; lng: number }) => {
      if (!session) return
      fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: 'STANDBY',
          lat: coords.lat,
          lng: coords.lng,
          status: 'available',
          driverName: session.name,
          vehicle: session.vehicle,
        }),
      }).catch(() => {})
    }

    broadcast(initialCoords)

    standbyIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setGpsCoords(c)
          broadcast(c)
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }, 15000)
  }

  useEffect(() => {
    return () => { if (standbyIntervalRef.current) clearInterval(standbyIntervalRef.current) }
  }, [])

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault()
    const code = bookingCode.trim().toUpperCase()
    if (!code) {
      setError('Masukkan kode booking.')
      return
    }
    if (!/^RTT-/.test(code)) {
      setError('Format kode salah. Contoh: RTT-ABC123')
      return
    }
    router.push(`/driver/${code}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('driver_session')
    router.push('/driver/login')
  }

  if (!session) return null

  // GPS gate — must grant before accessing dashboard
  if (gpsStatus === 'checking') {
    return (
      <div className="min-h-screen bg-volcanic flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-sunset/30 border-t-sunset rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cream-muted text-sm">Memeriksa izin lokasi...</p>
        </div>
      </div>
    )
  }

  if (gpsStatus === 'required' || gpsStatus === 'denied') {
    return (
      <div className="min-h-screen bg-volcanic flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-sunset/15 border-2 border-sunset/30 flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-10 h-10 text-sunset" />
            </div>
            <h1 className="font-display text-2xl text-cream mb-2">Aktifkan Lokasi</h1>
            <p className="text-cream-muted text-sm mb-6 leading-relaxed">
              Sebagai driver, lokasi kamu harus aktif agar pelanggan bisa memantau posisimu secara live. Izin lokasi <strong className="text-cream">wajib</strong> sebelum mulai bertugas.
            </p>

            {gpsStatus === 'denied' && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-lava/15 border border-lava/25 text-xs text-red-300 mb-4 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                Izin ditolak. Buka Pengaturan browser → izinkan akses lokasi untuk situs ini, lalu coba lagi.
              </div>
            )}

            <button onClick={requestGps} className="btn-primary w-full justify-center py-4 text-base mb-3">
              <Navigation className="w-5 h-5" />
              Aktifkan Lokasi Sekarang
            </button>

            <button onClick={handleLogout} className="w-full text-sm text-cream-muted hover:text-cream transition-colors py-2">
              Keluar
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-volcanic">
      {/* Header */}
      <div className="glass border-b border-white/8 px-5 py-4">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sunset to-gold flex items-center justify-center">
              <span className="text-volcanic font-bold text-sm font-display">
                {session.name[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-cream">{session.name}</p>
              <p className="text-xs text-cream-muted">{session.vehicle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gpsCoords && (
              <span className="flex items-center gap-1 text-xs text-jungle-light bg-jungle/15 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" />
                GPS Aktif
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-cream-muted hover:text-cream transition-colors px-3 py-2 rounded-full hover:bg-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-5 py-8 space-y-6">

        {/* Greeting */}
        <div>
          <h1 className="font-display text-2xl text-cream mb-1">
            Selamat datang, {session.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-cream-muted">
            Masukkan kode booking untuk mulai tracking perjalanan.
          </p>
        </div>

        {/* Enter booking code */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-sunset" />
            <h2 className="text-sm font-medium text-cream">Mulai Trip</h2>
          </div>

          <form onSubmit={handleStartTrip} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
              <input
                value={bookingCode}
                onChange={e => {
                  setBookingCode(e.target.value)
                  setError('')
                }}
                placeholder="RTT-XXXXXX"
                className="input-dark pl-10 w-full font-mono uppercase tracking-wider"
                autoCapitalize="characters"
              />
            </div>

            {error && (
              <p className="text-xs text-red-300">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-3">
              Buka Halaman Tracking
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Vehicle info */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-volcanic-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-cream-muted" />
          </div>
          <div>
            <p className="text-xs text-cream-muted">Kendaraan assigned</p>
            <p className="text-sm font-medium text-cream font-mono">{session.vehicle}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          {[
            'Minta kode booking dari admin atau tamu',
            'Masukkan kode di atas untuk membuka halaman tracking',
            'Klik "Mulai Kirim Lokasi" dan jangan tutup browser',
            'Update status perjalanan secara berkala',
          ].map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3 text-xs text-cream-muted"
            >
              <span className="w-5 h-5 rounded-full bg-volcanic-400 flex items-center justify-center text-sunset font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {tip}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
