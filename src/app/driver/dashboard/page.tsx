'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, LogOut, Truck, ArrowRight, Search, MapPin, AlertCircle, CheckCircle, Wrench, Zap, ShieldAlert, Bell, Clock, Users, Package, X, Calendar } from 'lucide-react'
import { getPusherClient } from '@/lib/pusher-client'
import { driverChannel } from '@/lib/pickup-times'

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
  const [currentStatus, setCurrentStatus] = useState<string>('available')
  const [schedule, setSchedule] = useState<Array<{
    code: string; packageTitle: string; date: string
    pickupTime: string; pickupName: string; guests: number; status: string
  }>>([])
  const [scheduleLoading, setScheduleLoading] = useState(true)

  // Incoming booking notification
  const [incomingBooking, setIncomingBooking] = useState<{
    bookingCode: string; packageTitle: string; customerName: string
    guests: number; pickupName: string; date: string; pickupTime: string
    totalUsd: number
  } | null>(null)
  const [countdown, setCountdown] = useState(60)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

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

  const startStandbyBroadcast = (initialCoords: { lat: number; lng: number }, status = 'available') => {
    if (standbyIntervalRef.current) clearInterval(standbyIntervalRef.current)
    setCurrentStatus(status)

    const broadcast = (coords: { lat: number; lng: number }, s: string) => {
      if (!session) return
      fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: 'STANDBY',
          lat: coords.lat,
          lng: coords.lng,
          status: s,
          driverName: session.name,
          vehicle: session.vehicle,
        }),
      }).catch(() => {})
    }

    broadcast(initialCoords, status)

    standbyIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setGpsCoords(c)
          broadcast(c, status)
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }, 15000)
  }

  const reportCondition = (status: string) => {
    if (!gpsCoords) return
    startStandbyBroadcast(gpsCoords, status)
  }

  useEffect(() => {
    return () => { if (standbyIntervalRef.current) clearInterval(standbyIntervalRef.current) }
  }, [])

  // Subscribe to driver-specific Pusher channel for incoming bookings
  useEffect(() => {
    if (!session) return
    let client: ReturnType<typeof getPusherClient>
    try { client = getPusherClient() } catch { return }

    const ch = client.subscribe(driverChannel(session.name))
    ch.bind('new-booking', (data: typeof incomingBooking) => {
      setIncomingBooking(data)
      setCountdown(60)
      if (countdownRef.current) clearInterval(countdownRef.current)
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!)
            setIncomingBooking(null)
            return 60
          }
          return prev - 1
        })
      }, 1000)
    })
    return () => { ch.unbind_all(); client.unsubscribe(driverChannel(session.name)) }
  }, [session])

  useEffect(() => {
    if (!session) return
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/driver/schedule?driverName=${encodeURIComponent(session.name)}`)
        const data = await res.json()
        if (data.ok) setSchedule(data.trips || [])
      } catch {
        // silently ignore network errors
      } finally {
        setScheduleLoading(false)
      }
    }
    fetchSchedule()
    const interval = setInterval(fetchSchedule, 60000)
    return () => clearInterval(interval)
  }, [session])

  const handleAccept = async () => {
    if (!incomingBooking || !session) return
    clearInterval(countdownRef.current!)
    await fetch('/api/driver/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: incomingBooking.bookingCode, action: 'accept', driverName: session.name }),
    })
    const code = incomingBooking.bookingCode
    setIncomingBooking(null)
    router.push(`/driver/${code}`)
  }

  const handleReject = async () => {
    if (!incomingBooking || !session) return
    clearInterval(countdownRef.current!)
    await fetch('/api/driver/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: incomingBooking.bookingCode, action: 'reject', driverName: session.name }),
    })
    setIncomingBooking(null)
  }

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

      {/* Incoming booking popup */}
      <AnimatePresence>
        {incomingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-sm glass-card rounded-3xl p-6 border-sunset/30"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-sunset/20 border-2 border-sunset/40 flex items-center justify-center animate-pulse">
                  <Bell className="w-6 h-6 text-sunset" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-cream">Orderan Masuk!</h2>
                  <p className="text-xs text-cream-muted">Konfirmasi dalam {countdown} detik</p>
                </div>
              </div>

              {/* Countdown bar */}
              <div className="w-full h-1.5 bg-volcanic-400 rounded-full mb-5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sunset to-gold rounded-full"
                  animate={{ width: `${(countdown / 60) * 100}%` }}
                  transition={{ duration: 0.9, ease: 'linear' }}
                />
              </div>

              {/* Trip details */}
              <div className="space-y-2.5 mb-6 text-sm">
                <div className="flex items-start gap-3 p-3 glass-card rounded-xl">
                  <Package className="w-4 h-4 text-sunset shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-cream-muted">Paket</p>
                    <p className="text-cream font-medium">{incomingBooking.packageTitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-3 glass-card rounded-xl">
                    <Users className="w-4 h-4 text-gold shrink-0" />
                    <div>
                      <p className="text-[10px] text-cream-muted">Tamu</p>
                      <p className="text-sm text-cream font-medium">{incomingBooking.guests} orang</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 glass-card rounded-xl">
                    <Clock className="w-4 h-4 text-ocean-light shrink-0" />
                    <div>
                      <p className="text-[10px] text-cream-muted">Jam Jemput</p>
                      <p className="text-sm text-sunset font-mono font-bold">{incomingBooking.pickupTime || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 glass-card rounded-xl">
                  <MapPin className="w-4 h-4 text-jungle-light shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-cream-muted">Pickup · {incomingBooking.date}</p>
                    <p className="text-sm text-cream">{incomingBooking.pickupName}</p>
                  </div>
                </div>
              </div>

              {/* Accept / Reject */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-lava/30 bg-lava/10 text-lava font-medium hover:bg-lava/20 transition-colors"
                >
                  <X className="w-4 h-4" /> Tolak
                </button>
                <button
                  onClick={handleAccept}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-jungle to-jungle-light text-volcanic font-bold hover:opacity-90 transition-opacity"
                >
                  <CheckCircle className="w-4 h-4" /> Terima
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Jadwal Saya */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-sunset" />
            <h2 className="text-sm font-medium text-cream">Jadwal Saya</h2>
          </div>

          {scheduleLoading ? (
            <div className="space-y-3">
              {[0, 1].map(i => (
                <div key={i} className="animate-pulse rounded-xl bg-white/5 h-16" />
              ))}
            </div>
          ) : schedule.length === 0 ? (
            <p className="text-xs text-cream-muted text-center py-4">Belum ada jadwal trip</p>
          ) : (
            <div className="space-y-3">
              {schedule.map(trip => {
                const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000)
                const tomorrowWib = new Date(nowWib)
                tomorrowWib.setDate(tomorrowWib.getDate() + 1)
                const tomorrowStr = tomorrowWib.toISOString().slice(0, 10)
                const isTomorrow = trip.date === tomorrowStr

                const statusBadge =
                  trip.status === 'dispatched'
                    ? 'bg-sunset/20 text-sunset border-sunset/30'
                    : trip.status === 'confirmed'
                    ? 'bg-ocean/20 text-ocean-light border-ocean/30'
                    : 'bg-gold/20 text-gold border-gold/30'

                return (
                  <div key={trip.code} className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cream">{trip.date}</span>
                        {isTomorrow && (
                          <span className="text-[10px] text-gold font-medium">Besok</span>
                        )}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusBadge}`}>
                        {trip.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-cream-muted shrink-0" />
                      <span className="text-sunset font-mono text-xs font-bold">{trip.pickupTime || '—'}</span>
                      <span className="text-cream-muted text-xs">· {trip.pickupName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-cream truncate">{trip.packageTitle}</span>
                      <span className="flex items-center gap-1 text-[10px] text-cream-muted shrink-0">
                        <Users className="w-3 h-3" />{trip.guests}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Vehicle info */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-volcanic-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-cream-muted" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-cream-muted">Kendaraan assigned</p>
            <p className="text-sm font-medium text-cream font-mono">{session.vehicle}</p>
          </div>
          {/* Current status badge */}
          <div className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            currentStatus === 'available'        ? 'bg-jungle/15 text-jungle-light border-jungle/25'
            : currentStatus === 'vehicle-problem'? 'bg-gold/20 text-gold border-gold/40'
            : currentStatus === 'service'        ? 'bg-white/8 text-cream-muted border-white/15'
            : currentStatus === 'accident'       ? 'bg-lava/25 text-lava border-lava/50'
            : 'bg-white/8 text-cream-muted border-white/15'
          }`}>
            {currentStatus === 'available' ? '✓ Normal'
              : currentStatus === 'vehicle-problem' ? '⚠ Kend. Masalah'
              : currentStatus === 'service' ? '🔧 Service'
              : currentStatus === 'accident' ? '🚨 Darurat'
              : currentStatus}
          </div>
        </div>

        {/* Laporkan kondisi */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-medium text-cream">Laporkan Kondisi</h2>
          </div>
          <p className="text-xs text-cream-muted mb-4 leading-relaxed">
            Kalau ada masalah di jalan, tekan tombol sesuai kondisi. Admin akan langsung melihat statusmu berubah.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => reportCondition('vehicle-problem')}
              disabled={!gpsCoords}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                currentStatus === 'vehicle-problem'
                  ? 'bg-gold/20 border-gold/40 text-gold'
                  : 'border-white/10 text-cream-muted hover:border-gold/30 hover:text-cream'
              }`}
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span>Kendaraan<br /><span className="text-xs font-normal">Bermasalah</span></span>
            </button>
            <button
              onClick={() => reportCondition('service')}
              disabled={!gpsCoords}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                currentStatus === 'service'
                  ? 'bg-white/12 border-white/25 text-cream'
                  : 'border-white/10 text-cream-muted hover:border-white/25 hover:text-cream'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>Sedang<br /><span className="text-xs font-normal">Service</span></span>
            </button>
            <button
              onClick={() => reportCondition('accident')}
              disabled={!gpsCoords}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                currentStatus === 'accident'
                  ? 'bg-lava/25 border-lava/50 text-lava'
                  : 'border-white/10 text-cream-muted hover:border-lava/40 hover:text-lava'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Kecelakaan<br /><span className="text-xs font-normal">/ Darurat</span></span>
            </button>
            <button
              onClick={() => reportCondition('available')}
              disabled={!gpsCoords}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                currentStatus === 'available'
                  ? 'bg-jungle/15 border-jungle/30 text-jungle-light'
                  : 'border-white/10 text-cream-muted hover:border-jungle/30 hover:text-jungle-light'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Normal<br /><span className="text-xs font-normal">Kembali OK</span></span>
            </button>
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
