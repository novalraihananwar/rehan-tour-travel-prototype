'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X, Navigation } from 'lucide-react'
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

const REGION_COLORS: Record<string, string> = {
  surabaya: '#E8703A',
  malang: '#D4A843',
  banyuwangi: '#3A8A65',
  bali: '#2589C8',
}

const REGION_LABELS: Record<string, string> = {
  surabaya: 'Surabaya',
  malang: 'Malang',
  banyuwangi: 'Banyuwangi',
  bali: 'Bali',
}

export function PickupMap({ onSelect, selectedId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)
  const markersRef = useRef<Map<string, ReturnType<typeof import('leaflet')['marker']>>>(new Map())
  const customMarkerRef = useRef<ReturnType<typeof import('leaflet')['marker']> | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<PickupLocation | null>(null)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    let L: typeof import('leaflet')

    const initMap = async () => {
      L = (await import('leaflet')).default

      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [-7.8, 113.5],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Add pickup point markers
      pickupPoints.forEach((point) => {
        if (!point.coordinates) return

        const color = REGION_COLORS[point.region] || '#E8703A'

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 32px; height: 32px;
              background: ${color};
              border: 2px solid rgba(255,255,255,0.8);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              cursor: pointer;
            "></div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        })

        const marker = L.marker([point.coordinates.lat, point.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 180px;">
              <p style="font-weight: 600; color: #1a1a1a; margin: 0 0 4px;">${point.name}</p>
              <p style="color: #666; font-size: 12px; margin: 0 0 6px;">${point.landmark}</p>
              ${point.additionalFee > 0
                ? `<p style="color: #E8703A; font-size: 12px; font-weight: 500;">+IDR ${point.additionalFee.toLocaleString()}</p>`
                : `<p style="color: #2D6A4F; font-size: 12px; font-weight: 500;">No extra fee</p>`
              }
              <button onclick="window.__selectPickup('${point.id}')" style="
                margin-top: 8px; width: 100%; padding: 6px 12px;
                background: #E8703A; color: white; border: none;
                border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
              ">Select this point</button>
            </div>
          `, { maxWidth: 220 })

        marker.on('click', () => {
          handleSelectPoint({
            id: point.id,
            name: point.name,
            address: point.address,
            lat: point.coordinates!.lat,
            lng: point.coordinates!.lng,
            additionalFee: point.additionalFee,
            region: point.region,
          })
        })

        markersRef.current.set(point.id, marker)
      })

      // Global handler for popup button clicks
      ;(window as Window & { __selectPickup?: (id: string) => void }).__selectPickup = (id: string) => {
        const point = pickupPoints.find(p => p.id === id)
        if (point && point.coordinates) {
          handleSelectPoint({
            id: point.id,
            name: point.name,
            address: point.address,
            lat: point.coordinates.lat,
            lng: point.coordinates.lng,
            additionalFee: point.additionalFee,
            region: point.region,
          })
          map.closePopup()
        }
      }

      // Click on map for custom pickup
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        if (customMarkerRef.current) {
          customMarkerRef.current.remove()
        }
        const customIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 36px; height: 36px;
              background: white;
              border: 3px solid #E8703A;
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 2px 12px rgba(232,112,58,0.5);
              cursor: pointer;
            ">
              <div style="width: 10px; height: 10px; background: #E8703A; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        customMarkerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map)
        customMarkerRef.current.on('dragend', (ev) => {
          const pos = ev.target.getLatLng()
          handleSelectCustom(pos.lat, pos.lng)
        })
        handleSelectCustom(lat, lng)
      })

      leafletMapRef.current = map
      setMapReady(true)
    }

    initMap()

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  const handleSelectPoint = (location: PickupLocation) => {
    setSelected(location)
    onSelect(location)
  }

  const handleSelectCustom = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const location: PickupLocation = {
        id: `custom-${Date.now()}`,
        name: data.address?.road || data.display_name?.split(',')[0] || 'Custom location',
        address: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        lat,
        lng,
        additionalFee: 0,
        region: 'custom',
        isCustom: true,
      }
      setSelected(location)
      onSelect(location)
    } catch {
      const location: PickupLocation = {
        id: `custom-${Date.now()}`,
        name: 'Custom location',
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        lat,
        lng,
        additionalFee: 0,
        region: 'custom',
        isCustom: true,
      }
      setSelected(location)
      onSelect(location)
    }
  }

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' East Java Bali Indonesia')}&format=json&limit=5&countrycodes=id`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setSearchResults(data)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSearchSelect = async (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setSearchQuery(result.display_name.split(',')[0])
    setSearchResults([])

    if (!leafletMapRef.current) return
    const L = (await import('leaflet')).default

    leafletMapRef.current.setView([lat, lng], 15)

    if (customMarkerRef.current) customMarkerRef.current.remove()
    const customIcon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:white;border:3px solid #E8703A;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(232,112,58,0.5);"><div style="width:10px;height:10px;background:#E8703A;border-radius:50%;"></div></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })
    customMarkerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(leafletMapRef.current)
    customMarkerRef.current.on('dragend', (ev) => {
      const pos = ev.target.getLatLng()
      handleSelectCustom(pos.lat, pos.lng)
    })
    handleSelectCustom(lat, lng)
  }

  const flyToRegion = async (region: string) => {
    if (!leafletMapRef.current) return
    setActiveRegion(region)
    const bounds: Record<string, [number, number, number]> = {
      surabaya: [-7.28, 112.74, 12],
      malang: [-7.98, 112.63, 12],
      banyuwangi: [-8.22, 114.37, 12],
      bali: [-8.45, 115.18, 10],
    }
    const [lat, lng, zoom] = bounds[region]
    leafletMapRef.current.setView([lat, lng], zoom)
  }

  return (
    <div className="space-y-3">
      {/* Region quick-jump tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(REGION_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => flyToRegion(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              activeRegion === key
                ? 'bg-sunset/20 border-sunset/50 text-sunset'
                : 'border-white/10 text-cream-muted hover:border-white/25 hover:text-cream'
            }`}
            style={activeRegion === key ? { borderColor: REGION_COLORS[key] + '80', color: REGION_COLORS[key] } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            handleSearch(e.target.value)
          }}
          placeholder="Search hotel, airport, station..."
          className="input-dark pl-10 pr-10 w-full"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSearchResults([]) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl overflow-hidden z-[1000] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSearchSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-sunset shrink-0" />
                <span className="text-sm text-cream truncate">{r.display_name.split(',').slice(0, 3).join(', ')}</span>
              </button>
            ))}
          </div>
        )}
        {searching && (
          <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl px-4 py-3 z-[1000]">
            <span className="text-sm text-cream-muted">Searching...</span>
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/8" style={{ height: '380px' }}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <div ref={mapRef} className="w-full h-full" />

        {!mapReady && (
          <div className="absolute inset-0 bg-volcanic-200 flex items-center justify-center">
            <div className="text-cream-muted text-sm">Loading map...</div>
          </div>
        )}

        {/* Hint overlay */}
        {mapReady && !selected && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className="glass rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-cream-muted">
                Click a marker to select a pickup point, or tap anywhere on the map for a custom location
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected location display */}
      {selected && (
        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5"
            style={{ background: selected.isCustom ? '#E8703A' : (REGION_COLORS[selected.region] || '#E8703A') + '25', border: `1.5px solid ${REGION_COLORS[selected.region] || '#E8703A'}50` }}
          >
            {selected.isCustom
              ? <Navigation className="w-4 h-4 text-sunset" />
              : <MapPin className="w-4 h-4" style={{ color: REGION_COLORS[selected.region] || '#E8703A' }} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cream">{selected.name}</p>
            <p className="text-xs text-cream-muted mt-0.5 truncate">{selected.address}</p>
            {selected.additionalFee > 0 && (
              <p className="text-xs text-gold mt-1">+IDR {selected.additionalFee.toLocaleString()} pickup fee</p>
            )}
            {selected.isCustom && (
              <p className="text-xs text-cream-muted mt-1">Custom pin — our driver will contact you to confirm exact meeting point</p>
            )}
          </div>
          <button
            onClick={() => {
              setSelected(null)
              if (customMarkerRef.current) {
                customMarkerRef.current.remove()
                customMarkerRef.current = null
              }
            }}
            className="text-cream-muted hover:text-cream shrink-0"
          >
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
          <span className="w-2.5 h-2.5 rounded-full border-2 border-sunset bg-white/80" />
          Custom pin
        </span>
      </div>
    </div>
  )
}
