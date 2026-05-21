'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, Clock, MapPin, Navigation, Phone,
  Star, Calendar, Users, Copy, Check,
} from 'lucide-react'
import { getPusherClient } from '@/lib/pusher-client'

const MapView = dynamic(() => import('./map-view'), { ssr: false, loading: () => (
  <div className="w-full h-full bg-volcanic-200 flex items-center justify-center rounded-2xl">
    <span className="text-cream-muted text-sm">Loading map...</span>
  </div>
) })

interface DriverLocation {
  lat: number
  lng: number
  status: string
  timestamp: number
  driverName?: string
}

const TIMELINE = [
  { id: 'confirmed',  label: 'Booking confirmed',    icon: CheckCircle },
  { id: 'assigned',   label: 'Driver assigned',       icon: Users },
  { id: 'en-route',  label: 'Driver on the way',     icon: Navigation },
  { id: 'arrived',   label: 'Driver arrived',         icon: MapPin },
  { id: 'on-trip',   label: 'Trip in progress',       icon: Star },
  { id: 'done',      label: 'Trip completed',         icon: CheckCircle },
]

const STATUS_ORDER = ['confirmed', 'assigned', 'en-route', 'arrived', 'on-trip', 'done']

function getStatusIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status)
  return idx === -1 ? 0 : idx
}

interface BookingInfo {
  packageTitle: string; date: string; pickupTime: string
  pickupName: string; guests: number; driverName: string | null
  status: string
}

export function BookingTrackerClient({ code }: { code: string }) {
  const [location, setLocation]     = useState<DriverLocation | null>(null)
  const [connected, setConnected]   = useState(false)
  const [copied, setCopied]         = useState(false)
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null)
  const channelRef = useRef<{ unbind_all: () => void } | null>(null)

  // Load booking details
  useEffect(() => {
    fetch(`/api/bookings?code=${code}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data) setBookingInfo({
          packageTitle: data.package_title || '',
          date:         data.date || '',
          pickupTime:   data.pickup_time || '',
          pickupName:   data.pickup_name || '',
          guests:       data.guests || 1,
          driverName:   data.driver_name || null,
          status:       data.status || 'pending',
        })
      })
      .catch(() => {})
  }, [code])

  // Load last known GPS location on mount
  useEffect(() => {
    fetch(`/api/driver/location?code=${code}`)
      .then(r => r.json())
      .then(data => { if (data) setLocation(data) })
      .catch(() => {})
  }, [code])

  // Subscribe to Pusher real-time updates (lazy init — browser only)
  useEffect(() => {
    let client: ReturnType<typeof getPusherClient>
    try {
      client = getPusherClient()
    } catch {
      return
    }
    const channel = client.subscribe(`booking-${code}`)
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', () => setConnected(true))
    channel.bind('location-update', (data: DriverLocation) => {
      setLocation(data)
      setConnected(true)
    })

    return () => {
      channel.unbind_all()
      client.unsubscribe(`booking-${code}`)
    }
  }, [code])

  const currentStatusIdx = location ? getStatusIndex(location.status) : 0
  const currentStep = TIMELINE[currentStatusIdx]

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(
    `Halo Rehan Tour! Saya ingin cek booking saya: *${code}*`
  )}`

  return (
    <div className="min-h-screen bg-volcanic pt-20">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-sunset tracking-widest uppercase mb-1">Booking tracker</p>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-3xl font-bold text-cream">{code}</h1>
              <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                {copied ? <Check className="w-4 h-4 text-jungle-light" /> : <Copy className="w-4 h-4 text-cream-muted" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
              connected ? 'bg-jungle/20 text-jungle-light' : 'bg-volcanic-400 text-cream-muted'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-jungle-light animate-pulse' : 'bg-cream-muted'}`} />
              {connected ? 'Live tracking' : 'Waiting for driver'}
            </div>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm px-4 py-2">
              <Phone className="w-4 h-4" /> Contact
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — map + driver info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Map */}
            <div className="glass-card rounded-2xl overflow-hidden" style={{ height: '380px' }}>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <MapView location={location} bookingCode={code} />
            </div>

            {/* Booking info card — pickup time + driver */}
            {bookingInfo && (
              <div className="glass-card rounded-2xl p-5 space-y-3">
                {bookingInfo.pickupTime && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sunset" />
                      <span className="text-sm text-cream-muted">Jam Jemput</span>
                    </div>
                    <span className="text-sunset font-mono font-bold text-base">{bookingInfo.pickupTime} WIB</span>
                  </div>
                )}
                {bookingInfo.pickupName && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-jungle-light" />
                      <span className="text-sm text-cream-muted">Pickup</span>
                    </div>
                    <span className="text-cream text-sm text-right max-w-[160px] truncate">{bookingInfo.pickupName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Driver card */}
            <AnimatePresence>
              {(location?.driverName || bookingInfo?.driverName) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sunset to-gold flex items-center justify-center text-volcanic font-bold text-lg font-display shrink-0">
                    {(location?.driverName || bookingInfo?.driverName || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-cream">{location?.driverName || bookingInfo?.driverName}</p>
                    <p className="text-xs text-cream-muted">
                      {location ? 'Live tracking aktif' : 'Driver assigned · menunggu keberangkatan'}
                    </p>
                  </div>
                  <a
                    href="tel:+6281234567890"
                    className="w-10 h-10 rounded-full bg-jungle/20 flex items-center justify-center text-jungle-light hover:bg-jungle/30 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Last update */}
            {location && (
              <p className="text-xs text-cream-muted text-center">
                Last update:{' '}
                {new Date(location.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}
                {' '}· {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Right — timeline + actions */}
          <div className="space-y-4">

            {/* Status timeline */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-sm font-medium text-cream mb-5">Trip status</h2>
              <div className="space-y-0">
                {TIMELINE.map((step, i) => {
                  const done    = i < currentStatusIdx
                  const active  = i === currentStatusIdx
                  const pending = i > currentStatusIdx
                  return (
                    <div key={step.id} className="flex gap-3">
                      {/* Icon + line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          done   ? 'bg-jungle/25 border border-jungle/40' :
                          active ? 'bg-gradient-to-br from-sunset to-gold' :
                                   'bg-volcanic-400 border border-white/8'
                        }`}>
                          <step.icon className={`w-3.5 h-3.5 ${
                            done ? 'text-jungle-light' : active ? 'text-volcanic' : 'text-cream-muted'
                          }`} />
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className={`w-px flex-1 my-1 min-h-[20px] ${done ? 'bg-jungle/30' : 'bg-white/8'}`} />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pb-4 pt-1">
                        <p className={`text-sm font-medium transition-colors ${
                          active ? 'text-cream' : done ? 'text-jungle-light' : 'text-cream-muted'
                        }`}>
                          {step.label}
                        </p>
                        {active && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-sunset mt-0.5"
                          >
                            {location ? 'Updated live' : 'Waiting for update...'}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Share driver tracking link */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs text-cream-muted mb-3">Share with travel buddy</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${code}`}
                  className="input-dark flex-1 text-xs py-2"
                />
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: 'Track our trip!',
                      url: `${window.location.origin}/booking/${code}`,
                    }) || navigator.clipboard.writeText(`${window.location.origin}/booking/${code}`)
                  }}
                  className="btn-ghost px-3 py-2 text-xs shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              <Phone className="w-4 h-4" />
              WhatsApp Admin
            </a>

            <Link href="/packages" className="btn-ghost w-full justify-center py-3 text-sm">
              Book another trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
