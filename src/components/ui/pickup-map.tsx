'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X, Navigation, AlertCircle } from 'lucide-react'
import { pickupPoints } from '@/lib/data'

interface PickupLocation {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  additionalFee: number
  region: string
  isCustom?: boolean
}

interface Props {
  onSelect: (location: PickupLocation) => void
  selectedId?: string
}

// Valid pickup corridor polygon: Surabaya → Malang → Jember → Banyuwangi → Bali
// Excludes off-route areas: Blitar, Nganjuk, Kediri, Madiun, Bojonegoro
const CORRIDOR_POLYGON: [number, number][] = [
  [-7.05, 112.50], // Surabaya NW
  [-7.05, 113.20], // Surabaya NE coast
  [-7.35, 113.60], // Pasuruan coast
  [-7.65, 113.80], // Probolinggo east
  [-7.90, 113.90], // Lumajang north
  [-8.10, 114.00], // Lumajang south
  [-8.20, 114.30], // Jember east
  [-8.35, 114.55], // Banyuwangi north
  [-8.50, 114.65], // Banyuwangi city
  [-8.75, 115.75], // Bali NE
  [-8.95, 115.50], // Bali SE
  [-8.85, 114.90], // Bali SW
  [-8.55, 114.55], // Banyuwangi south
  [-8.30, 114.20], // corridor south
  [-8.25, 113.60], // Jember south
  [-8.20, 113.00], // Malang SE
  [-8.30, 112.75], // Malang south boundary
  [-8.15, 112.40], // Malang SW limit
  [-7.90, 112.30], // Malang west boundary
  [-7.50, 112.35], // south Surabaya west
  [-7.20, 112.45], // Surabaya SW
  [-7.05, 112.50], // close polygon
]

const REGION_COLORS: Record<string, string> = {
  surabaya:  '#E8703A',
  malang:    '#D4A843',
  banyuwangi:'#2D6A4F',
  bali:      '#1E6FAF',
}

const REGION_LABELS: Record<string, string> = {
  surabaya:   'Surabaya',
  malang:     'Malang',
  banyuwangi: 'Banyuwangi',
  bali:       'Bali',
}

// Point-in-polygon (ray casting)
function isInCorridor(lat: number, lng: number): boolean {
  const poly = CORRIDOR_POLYGON
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i]
    const [yj, xj] = poly[j]
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function PickupMap({ onSelect, selectedId }: Props) {
  const mapRef        = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)
  const markersRef    = useRef<Map<string, ReturnType<typeof import('leaflet')['marker']>>>(new Map())
  const customRef     = useRef<ReturnType<typeof import('leaflet')['marker']> | null>(null)

  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([])
  const [searching,     setSearching]     = useState(false)
  const [selected,      setSelected]      = useState<PickupLocation | null>(null)
  const [activeRegion,  setActiveRegion]  = useState<string | null>(null)
  const [mapReady,      setMapReady]      = useState(false)
  const [outOfRange,    setOutOfRange]    = useState(false)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    let L: typeof import('leaflet')

    const init = async () => {
      L = (await import('leaflet')).default

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [-7.9, 113.5],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
        maxBounds: [[-9.5, 111.0], [-6.5, 116.5]], // restrict pan to EJ+Bali
        maxBoundsViscosity: 0.9,
      })

      // Light/white map tiles (CartoDB Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Draw corridor boundary overlay (dimmed outside)
      const outerBounds: [number, number][] = [
        [-9.5, 111.0], [-9.5, 116.5], [-6.5, 116.5], [-6.5, 111.0],
      ]
      L.polygon([outerBounds, CORRIDOR_POLYGON], {
        fillColor: '#6b7280',
        fillOpacity: 0.18,
        stroke: false,
        interactive: false,
      }).addTo(map)

      // Corridor border line
      L.polygon(CORRIDOR_POLYGON, {
        color: '#E8703A',
        weight: 1.5,
        opacity: 0.5,
        fill: false,
        dashArray: '5 4',
        interactive: false,
      }).addTo(map)

      // Preset pickup markers
      pickupPoints.forEach((point) => {
        if (!point.coordinates) return
        const color = REGION_COLORS[point.region] || '#E8703A'

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:${color};border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        })

        const marker = L.marker([point.coordinates.lat, point.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui;min-width:180px;padding:2px 0;">
              <p style="font-weight:700;color:#111;margin:0 0 3px;">${point.name}</p>
              <p style="color:#555;font-size:12px;margin:0 0 5px;">${point.landmark}</p>
              ${point.additionalFee > 0
                ? `<p style="color:#E8703A;font-size:12px;font-weight:600;">+IDR ${point.additionalFee.toLocaleString()}</p>`
                : `<p style="color:#2D6A4F;font-size:12px;font-weight:600;">No extra fee</p>`}
              <button onclick="window.__selectPickup('${point.id}')" style="margin-top:8px;width:100%;padding:6px 12px;background:#E8703A;color:white;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">Select</button>
            </div>
          `, { maxWidth: 220 })

        marker.on('click', () => handleSelectPoint({
          id: point.id, name: point.name, address: point.address,
          lat: point.coordinates!.lat, lng: point.coordinates!.lng,
          additionalFee: point.additionalFee, region: point.region,
        }))

        markersRef.current.set(point.id, marker)
      })

      ;(window as Window & { __selectPickup?: (id: string) => void }).__selectPickup = (id: string) => {
        const point = pickupPoints.find(p => p.id === id)
        if (point?.coordinates) {
          handleSelectPoint({
            id: point.id, name: point.name, address: point.address,
            lat: point.coordinates.lat, lng: point.coordinates.lng,
            additionalFee: point.additionalFee, region: point.region,
          })
          map.closePopup()
        }
      }

      // Custom pin on map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        if (!isInCorridor(lat, lng)) {
          setOutOfRange(true)
          setTimeout(() => setOutOfRange(false), 3500)
          return
        }
        setOutOfRange(false)
        placeCustomPin(L, map, lat, lng)
        handleSelectCustom(lat, lng)
      })

      leafletMapRef.current = map
      setMapReady(true)
    }

    init()
    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null }
    }
  }, [])

  const placeCustomPin = async (L: typeof import('leaflet'), map: ReturnType<typeof import('leaflet')['map']>, lat: number, lng: number) => {
    if (customRef.current) customRef.current.remove()
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:34px;height:34px;background:white;border:3px solid #E8703A;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(232,112,58,0.4);"><div style="width:10px;height:10px;background:#E8703A;border-radius:50%;"></div></div>`,
      iconSize: [34, 34], iconAnchor: [17, 17],
    })
    customRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map)
    customRef.current.on('dragend', (ev) => {
      const pos = ev.target.getLatLng()
      if (!isInCorridor(pos.lat, pos.lng)) {
        setOutOfRange(true)
        setTimeout(() => setOutOfRange(false), 3500)
        customRef.current?.setLatLng([lat, lng]) // snap back
        return
      }
      handleSelectCustom(pos.lat, pos.lng)
    })
  }

  const handleSelectPoint = (loc: PickupLocation) => { setSelected(loc); onSelect(loc) }

  const handleSelectCustom = async (lat: number, lng: number) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      const loc: PickupLocation = {
        id: `custom-${Date.now()}`, name: data.address?.road || data.display_name?.split(',')[0] || 'Custom location',
        address: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        lat, lng, additionalFee: 0, region: 'custom', isCustom: true,
      }
      setSelected(loc); onSelect(loc)
    } catch {
      const loc: PickupLocation = {
        id: `custom-${Date.now()}`, name: 'Custom location',
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        lat, lng, additionalFee: 0, region: 'custom', isCustom: true,
      }
      setSelected(loc); onSelect(loc)
    }
  }

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' East Java Bali Indonesia')}&format=json&limit=5&countrycodes=id`, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      // Filter to only show results within corridor
      const filtered = data.filter((r: { lat: string; lon: string }) => isInCorridor(parseFloat(r.lat), parseFloat(r.lon)))
      setSearchResults(filtered)
    } catch { setSearchResults([]) } finally { setSearching(false) }
  }

  const handleSearchSelect = async (r: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(r.lat), lng = parseFloat(r.lon)
    setSearchQuery(r.display_name.split(',')[0])
    setSearchResults([])
    if (!leafletMapRef.current) return
    const L = (await import('leaflet')).default
    leafletMapRef.current.setView([lat, lng], 15)
    placeCustomPin(L, leafletMapRef.current, lat, lng)
    handleSelectCustom(lat, lng)
  }

  const flyToRegion = async (region: string) => {
    if (!leafletMapRef.current) return
    setActiveRegion(region)
    const bounds: Record<string, [number, number, number]> = {
      surabaya:   [-7.28, 112.74, 12],
      malang:     [-7.98, 112.63, 12],
      banyuwangi: [-8.22, 114.37, 12],
      bali:       [-8.45, 115.18, 10],
    }
    const [la, ln, z] = bounds[region]
    leafletMapRef.current.setView([la, ln], z)
  }

  return (
    <div className="space-y-3">
      {/* Region quick jump */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(REGION_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => flyToRegion(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              activeRegion === key ? 'border-transparent text-white' : 'border-white/10 text-cream-muted hover:border-white/25 hover:text-cream'
            }`}
            style={activeRegion === key ? { background: REGION_COLORS[key] } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
        <input
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); handleSearch(e.target.value) }}
          placeholder="Cari hotel, bandara, stasiun..."
          className="input-dark pl-10 pr-10 w-full"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(''); setSearchResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream">
            <X className="w-4 h-4" />
          </button>
        )}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl overflow-hidden z-[1000] shadow-xl border border-gray-100">
            {searchResults.map((r, i) => (
              <button key={i} onClick={() => handleSearchSelect(r)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-sm text-gray-700 truncate">{r.display_name.split(',').slice(0, 3).join(', ')}</span>
              </button>
            ))}
          </div>
        )}
        {searching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl px-4 py-3 z-[1000] shadow-xl">
            <span className="text-sm text-gray-500">Mencari...</span>
          </div>
        )}
      </div>

      {/* Out of range warning */}
      {outOfRange && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-lava/15 border border-lava/25 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Lokasi ini di luar area layanan kami (Surabaya → Bali). Pilih titik yang searah rute.
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-white/8" style={{ height: '380px' }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Memuat peta...</span>
          </div>
        )}
        {mapReady && !selected && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-sm">
              <p className="text-xs text-gray-500">Klik marker untuk pilih titik jemput, atau ketuk peta untuk pin custom</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected location */}
      {selected && (
        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-sunset/15 border border-sunset/30">
            {selected.isCustom ? <Navigation className="w-4 h-4 text-sunset" /> : <MapPin className="w-4 h-4 text-sunset" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cream">{selected.name}</p>
            <p className="text-xs text-cream-muted mt-0.5 truncate">{selected.address}</p>
            {selected.additionalFee > 0 && <p className="text-xs text-gold mt-1">+IDR {selected.additionalFee.toLocaleString()} biaya jemput</p>}
            {selected.isCustom && <p className="text-xs text-cream-muted mt-1">Pin custom — driver akan konfirmasi via WhatsApp</p>}
          </div>
          <button onClick={() => { setSelected(null); if (customRef.current) { customRef.current.remove(); customRef.current = null } }} className="text-cream-muted hover:text-cream shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-cream-muted">
        {Object.entries(REGION_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: REGION_COLORS[key] }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-sunset bg-white" />
          Pin custom
        </span>
      </div>
    </div>
  )
}
