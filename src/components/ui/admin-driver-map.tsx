'use client'

import { useEffect, useRef, useState } from 'react'
import { getPusherClient } from '@/lib/pusher-client'

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
  available:  '#2D6A4F',
  standby:    '#D4A843',
  confirmed:  '#2589C8',
  'en-route': '#E8703A',
  arrived:    '#9B59B6',
  'on-trip':  '#C0392B',
  completed:  '#2D6A4F',
  offline:    '#6B7280',
}

const STATUS_LABELS: Record<string, string> = {
  available:  'Tersedia',
  standby:    'Standby',
  confirmed:  'Terima Orderan',
  'en-route': 'Menuju Jemput',
  arrived:    'Di Lokasi',
  'on-trip':  'Sedang Trip',
  completed:  'Selesai',
  offline:    'Offline',
}

interface Props {
  initialDrivers?: DriverState[]
}

export default function AdminDriverMap({ initialDrivers = [] }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapInst    = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)
  const markersRef = useRef<Map<string, ReturnType<typeof import('leaflet')['marker']>>>(new Map())
  const [drivers, setDrivers] = useState<DriverState[]>(initialDrivers)
  const [selected, setSelected] = useState<DriverState | null>(null)

  // Subscribe to admin Pusher channel
  useEffect(() => {
    let client: ReturnType<typeof getPusherClient>
    try { client = getPusherClient() } catch { return }

    const ch = client.subscribe('admin-drivers')
    ch.bind('driver-update', (data: DriverState) => {
      setDrivers(prev => {
        const idx = prev.findIndex(d => d.driverName === data.driverName)
        if (idx >= 0) { const n = [...prev]; n[idx] = data; return n }
        return [...prev, data]
      })
      updateMarker(data)
    })
    return () => { ch.unbind_all(); client.unsubscribe('admin-drivers') }
  }, [])

  const updateMarker = async (driver: DriverState) => {
    if (!mapInst.current) return
    const L = (await import('leaflet')).default
    const color = STATUS_COLORS[driver.status] || '#6B7280'

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;">
          <div style="
            width:38px;height:38px;
            background:${color};
            border:3px solid white;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 3px 10px rgba(0,0,0,0.3);
            cursor:pointer;
            font-size:14px;font-weight:700;color:white;
            font-family:system-ui;
          ">${driver.driverName.split('.')[0][0].toUpperCase()}</div>
          ${driver.status === 'en-route' || driver.status === 'on-trip' ? `
          <div style="
            position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);
            width:8px;height:8px;background:${color};border-radius:50%;
            animation:ping 1s cubic-bezier(0,0,.2,1) infinite;
          "></div>` : ''}
        </div>`,
      iconSize: [38, 38], iconAnchor: [19, 19],
    })

    const existing = markersRef.current.get(driver.driverName)
    if (existing) {
      existing.setLatLng([driver.lat, driver.lng])
      existing.setIcon(icon)
    } else {
      const marker = L.marker([driver.lat, driver.lng], { icon })
        .addTo(mapInst.current!)
        .on('click', () => setSelected(driver))
      markersRef.current.set(driver.driverName, marker)
    }
  }

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return

    const init = async () => {
      const L = (await import('leaflet')).default
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl

      const map = L.map(mapRef.current!, {
        center: [-7.9, 113.5], zoom: 8,
        zoomControl: true, attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)

      // Route line Surabaya → Bali
      L.polyline([
        [-7.28, 112.74], [-7.98, 112.63], [-8.13, 113.22],
        [-8.17, 113.70], [-8.22, 114.37], [-8.45, 115.18],
      ], { color: '#E8703A', weight: 2, opacity: 0.4, dashArray: '6 4' }).addTo(map)

      mapInst.current = map

      // Place initial markers
      for (const d of initialDrivers) await updateMarker(d)
    }

    init()
    return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null } }
  }, [])

  // Sync when initialDrivers prop changes (fleet page polling every 10s)
  useEffect(() => {
    if (initialDrivers.length === 0) return
    initialDrivers.forEach(d => updateMarker(d))
    setDrivers(prev => {
      const map = new Map(prev.map(d => [d.driverName, d]))
      initialDrivers.forEach(d => {
        const existing = map.get(d.driverName)
        if (!existing || d.updatedAt >= existing.updatedAt) map.set(d.driverName, d)
      })
      return Array.from(map.values())
    })
  }, [initialDrivers])

  // Update markers when drivers state changes (Pusher real-time)
  useEffect(() => {
    drivers.forEach(d => updateMarker(d))
  }, [drivers])

  return (
    <div className="relative h-full">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="w-full h-full" />

      {/* Selected driver popup */}
      {selected && (
        <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-xl p-4 w-64 z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: STATUS_COLORS[selected.status] }}>
                {selected.driverName[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{selected.driverName}</p>
                <p className="text-xs text-gray-500">{selected.vehicle}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[selected.status] }} />
              <span className="font-medium" style={{ color: STATUS_COLORS[selected.status] }}>
                {STATUS_LABELS[selected.status] || selected.status}
              </span>
            </div>
            {selected.bookingCode && <p className="text-gray-600">Booking: <span className="font-mono font-medium">{selected.bookingCode}</span></p>}
            {selected.pickupName && <p className="text-gray-600">Jemput: {selected.pickupName}</p>}
            <p className="text-gray-400">{new Date(selected.updatedAt).toLocaleTimeString('id-ID')}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000]">
        <p className="text-xs font-semibold text-gray-600 mb-2">Status Driver</p>
        <div className="space-y-1.5">
          {Object.entries(STATUS_LABELS).slice(0, 6).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[key] }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
