'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Navigation, Phone, CheckCircle, MapPin, Truck,
  Clock, AlertCircle, ChevronRight, X, User, Users
} from 'lucide-react'

const RouteMapMini = dynamic(() => import('./route-map-mini'), {
  ssr: false,
  loading: () => <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />,
})

interface DriverSession {
  id: string | null
  username: string
  name: string
  vehicle: string
  loginAt: number
}

// Booking mock — replace with Supabase fetch when schema is ready
const MOCK_BOOKINGS: Record<string, {
  customerName: string
  packageTitle: string
  date: string
  guests: number
  whatsapp: string
  pickupName: string
  pickupLat: number
  pickupLng: number
}> = {
  'RTT-TEST': {
    customerName: 'Demo Customer',
    packageTitle: 'Bromo Sunrise Classic',
    date: '2026-05-25',
    guests: 2,
    whatsapp: '6281234567890',
    pickupName: 'Juanda Airport — Terminal 1',
    pickupLat: -7.3797,
    pickupLng: 112.7868,
  },
}

const FLOW_STEPS = [
  { id: 'incoming',  label: 'Orderan Baru',         color: 'from-blue-500 to-blue-600' },
  { id: 'confirmed', label: 'Order Dikonfirmasi',    color: 'from-sunset to-gold' },
  { id: 'en-route',  label: 'Menuju Lokasi Jemput',  color: 'from-sunset to-gold' },
  { id: 'arrived',   label: 'Sudah di Lokasi',       color: 'from-jungle to-jungle-light' },
  { id: 'on-trip',   label: 'Trip Berlangsung',       color: 'from-lava to-red-400' },
  { id: 'completed', label: 'Trip Selesai',           color: 'from-jungle to-teal-400' },
]

export default function DriverPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()

  const [session, setSession]         = useState<DriverSession | null>(null)
  const [tripStatus, setTripStatus]   = useState<string>('incoming')
  const [coords, setCoords]           = useState<{ lat: number; lng: number } | null>(null)
  const [connected, setConnected]     = useState(false)
  const [lastSent, setLastSent]       = useState<Date | null>(null)
  const [gpsError, setGpsError]       = useState('')
  const [showDecline, setShowDecline] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const booking = MOCK_BOOKINGS[code as string] || {
    customerName: 'Tamu',
    packageTitle: 'Tour Package',
    date: '',
    guests: 1,
    whatsapp: '',
    pickupName: 'Lokasi penjemputan',
    pickupLat: -7.28,
    pickupLng: 112.74,
  }

  // Auth check
  useEffect(() => {
    const raw = localStorage.getItem('driver_session')
    if (!raw) { router.replace('/driver/login'); return }
    const data: DriverSession = JSON.parse(raw)
    if (Date.now() - data.loginAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem('driver_session')
      router.replace('/driver/login')
      return
    }
    setSession(data)
  }, [router])

  const sendLocation = useCallback(async (lat: number, lng: number, status: string) => {
    if (!session) return
    try {
      const res = await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: code,
          lat, lng,
          status,
          driverName: session.name,
          vehicle: session.vehicle,
          pickupName: booking.pickupName,
          pickupLat: booking.pickupLat,
          pickupLng: booking.pickupLng,
          customerName: booking.customerName,
        }),
      })
      if (res.ok) { setConnected(true); setLastSent(new Date()) }
    } catch { setConnected(false) }
  }, [session, code, booking])

  const startGPS = useCallback((status: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords
          setCoords({ lat, lng })
          sendLocation(lat, lng, status)
          setGpsError('')
        },
        () => { setConnected(false); setGpsError('GPS tidak tersedia.') },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }, 5000)
  }, [sendLocation])

  const stopGPS = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setConnected(false)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const handleAccept = () => {
    setTripStatus('confirmed')
    setTimeout(() => {
      setTripStatus('en-route')
      startGPS('en-route')
    }, 1500)
  }

  const handleArrived = () => {
    setTripStatus('arrived')
    sendLocation(coords?.lat || booking.pickupLat, coords?.lng || booking.pickupLng, 'arrived')
  }

  const handleStartTrip = () => {
    setTripStatus('on-trip')
    startGPS('on-trip')
  }

  const handleFinishTrip = () => {
    stopGPS()
    setTripStatus('completed')
    sendLocation(coords?.lat || 0, coords?.lng || 0, 'completed')
  }

  if (!session) return null

  const currentStep = FLOW_STEPS.find(s => s.id === tripStatus)

  return (
    <div className="min-h-screen bg-volcanic flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/8 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sunset to-gold flex items-center justify-center text-volcanic font-bold font-display">
            {session.name[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-cream leading-none">{session.name}</p>
            <p className="text-xs text-cream-muted">{session.vehicle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${connected ? 'bg-jungle/20 text-jungle-light' : 'bg-volcanic-400 text-cream-muted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-jungle-light animate-pulse' : 'bg-cream-muted'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 max-w-sm mx-auto w-full pb-8">

        {/* Booking code */}
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-cream-muted mb-1">Booking</p>
          <p className="font-mono text-xl font-bold text-sunset tracking-widest">{code}</p>
        </div>

        {/* STATUS FLOW */}

        {/* 1. INCOMING — Accept or decline */}
        {tripStatus === 'incoming' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cream">Orderan Masuk!</p>
                  <p className="text-xs text-cream-muted">Konfirmasi dalam 60 detik</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm mb-4">
                {[
                  { icon: User,    label: 'Tamu',    value: booking.customerName },
                  { icon: Truck,   label: 'Paket',   value: booking.packageTitle },
                  { icon: MapPin,  label: 'Jemput',  value: booking.pickupName },
                  { icon: Users,   label: 'Orang',   value: `${booking.guests} pax` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-cream-muted shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-cream-muted">{label} </span>
                      <span className="text-cream font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call customer */}
              {booking.whatsapp && (
                <a
                  href={`tel:+${booking.whatsapp}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-jungle/30 bg-jungle/10 text-jungle-light text-sm font-medium mb-4 hover:bg-jungle/20 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Telepon Pembeli
                </a>
              )}

              <button onClick={handleAccept} className="btn-primary w-full justify-center py-3.5 text-base">
                <CheckCircle className="w-5 h-5" />
                Terima Orderan
              </button>
            </div>

            <button onClick={() => setShowDecline(true)} className="w-full text-sm text-cream-muted text-center py-2 hover:text-cream transition-colors">
              Tolak orderan
            </button>
          </motion.div>
        )}

        {/* 2. CONFIRMED — brief confirmation */}
        {tripStatus === 'confirmed' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset to-gold flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-volcanic" />
            </div>
            <h2 className="font-display text-xl text-cream mb-1">Order Dikonfirmasi!</h2>
            <p className="text-cream-muted text-sm">Memulai navigasi...</p>
          </motion.div>
        )}

        {/* 3. EN ROUTE — map + GPS active */}
        {tripStatus === 'en-route' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sunset animate-pulse" />
                  <span className="text-sm font-medium text-cream">Menuju Lokasi Jemput</span>
                </div>
                {lastSent && <span className="text-xs text-cream-muted">{lastSent.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
              </div>
              <div className="h-52">
                <RouteMapMini
                  driverCoords={coords}
                  pickupLat={booking.pickupLat}
                  pickupLng={booking.pickupLng}
                  pickupName={booking.pickupName}
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-cream-muted mb-1">Tujuan penjemputan</p>
              <p className="text-sm font-medium text-cream flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sunset shrink-0" />
                {booking.pickupName}
              </p>
            </div>

            {gpsError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-lava/15 border border-lava/25 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {gpsError}
              </div>
            )}

            <button onClick={handleArrived} className="btn-primary w-full justify-center py-4 text-base">
              <CheckCircle className="w-5 h-5" />
              Sudah di Lokasi Penjemputan
            </button>
          </motion.div>
        )}

        {/* 4. ARRIVED */}
        {tripStatus === 'arrived' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-jungle/20 border-2 border-jungle flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-jungle-light" />
              </div>
              <h2 className="font-display text-xl text-cream mb-1">Sudah di Lokasi!</h2>
              <p className="text-cream-muted text-sm">{booking.pickupName}</p>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <p className="text-sm text-cream-muted mb-3">Hubungi tamu untuk konfirmasi:</p>
              <a
                href={`tel:+${booking.whatsapp}`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-jungle/30 bg-jungle/10 text-jungle-light font-medium hover:bg-jungle/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Telepon {booking.customerName}
              </a>
            </div>

            <button onClick={handleStartTrip} className="btn-primary w-full justify-center py-4 text-base">
              <ChevronRight className="w-5 h-5" />
              Mulai Trip — Penumpang Sudah Naik
            </button>
          </motion.div>
        )}

        {/* 5. ON TRIP */}
        {tripStatus === 'on-trip' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-lava/20 border-2 border-lava flex items-center justify-center">
                    <Truck className="w-5 h-5 text-red-300" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-lava rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cream">Trip Berlangsung</p>
                  <p className="text-xs text-cream-muted">{booking.packageTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-cream-muted">
                <div className="w-2 h-2 rounded-full bg-sunset animate-pulse" />
                Posisi dikirim live · tamu bisa lihat di tracker
              </div>
            </div>

            {coords && (
              <div className="glass-card rounded-2xl p-3 font-mono text-xs text-cream-muted text-center">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                {lastSent && <span className="ml-2 text-jungle-light">· {lastSent.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
              </div>
            )}

            <button
              onClick={handleFinishTrip}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-base font-medium text-white transition-all duration-300 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #3A8A65)' }}
            >
              <CheckCircle className="w-5 h-5" />
              Trip Selesai — Konfirmasi
            </button>
          </motion.div>
        )}

        {/* 6. COMPLETED */}
        {tripStatus === 'completed' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-jungle/20 border-2 border-jungle flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-jungle-light" />
              </div>
              <h2 className="font-display text-2xl text-cream mb-2">Trip Selesai!</h2>
              <p className="text-cream-muted text-sm">Terima kasih, {session.name.split(' ')[0]}. Status kamu kembali tersedia.</p>
            </div>

            <button
              onClick={() => router.push('/driver/dashboard')}
              className="btn-primary w-full justify-center py-4"
            >
              Kembali ke Dashboard
            </button>
          </motion.div>
        )}

      </div>

      {/* Decline modal */}
      <AnimatePresence>
        {showDecline && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="w-full max-w-sm glass-card rounded-t-3xl p-6 mx-4 mb-0">
              <h3 className="font-display text-lg text-cream mb-2">Tolak Orderan?</h3>
              <p className="text-cream-muted text-sm mb-6">Orderan ini akan dikembalikan ke admin. Kamu yakin?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDecline(false)} className="btn-ghost flex-1 justify-center py-3">Batal</button>
                <button
                  onClick={() => { setShowDecline(false); router.push('/driver/dashboard') }}
                  className="flex-1 py-3 rounded-full bg-lava/80 text-white font-medium text-sm hover:bg-lava transition-colors"
                >
                  Ya, Tolak
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
