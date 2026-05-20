'use client'

import { useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface Props {
  driverCoords: { lat: number; lng: number } | null
  pickupLat: number
  pickupLng: number
  pickupName: string
}

export default function RouteMapMini({ driverCoords, pickupLat, pickupLng, pickupName }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const mapInst     = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)
  const driverRef   = useRef<ReturnType<typeof import('leaflet')['marker']> | null>(null)
  const routeRef    = useRef<ReturnType<typeof import('leaflet')['polyline']> | null>(null)
  const [eta, setEta] = useState<string | null>(null)
  const [dist, setDist] = useState<string | null>(null)

  // Fetch OSRM route
  const fetchRoute = async (dLat: number, dLng: number): Promise<[number, number][]> => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${dLng},${dLat};${pickupLng},${pickupLat}?overview=full&geometries=geojson`
      const res  = await fetch(url)
      const data = await res.json()
      if (data.code !== 'Ok' || !data.routes[0]) return []

      const route = data.routes[0]
      const seconds = route.duration
      const meters  = route.distance

      // ETA
      const mins = Math.round(seconds / 60)
      setEta(mins < 60 ? `${mins} menit` : `${Math.floor(mins / 60)}j ${mins % 60}m`)
      setDist(meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`)

      // Convert GeoJSON coords [lng, lat] → Leaflet [lat, lng]
      return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
    } catch {
      // Fallback: straight line
      return [[dLat, dLng], [pickupLat, pickupLng]]
    }
  }

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return

    const init = async () => {
      const L = (await import('leaflet')).default
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center: [number, number] = driverCoords
        ? [(driverCoords.lat + pickupLat) / 2, (driverCoords.lng + pickupLng) / 2]
        : [pickupLat, pickupLng]

      const map = L.map(mapRef.current!, {
        center, zoom: 12,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
      })

      // Light map tiles — not dark
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      // Pickup destination marker (orange pin)
      const pickupIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;">
            <div style="width:36px;height:36px;background:#E8703A;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(232,112,58,0.5);"></div>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      L.marker([pickupLat, pickupLng], { icon: pickupIcon })
        .addTo(map)
        .bindTooltip(pickupName, { permanent: true, direction: 'top', offset: [0, -38] })

      mapInst.current = map

      // Draw initial route if driver coords available
      if (driverCoords) {
        await updateDriverAndRoute(L, map, driverCoords.lat, driverCoords.lng)
      }
    }

    init()
    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null }
    }
  }, [])

  const updateDriverAndRoute = async (
    L: typeof import('leaflet'),
    map: ReturnType<typeof import('leaflet')['map']>,
    dLat: number, dLng: number
  ) => {
    // Driver car icon
    const carIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          width:40px;height:40px;
          background:white;
          border:3px solid #E8703A;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 12px rgba(232,112,58,0.4);
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8703A">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/>
            <circle cx="7.5" cy="14.5" r="1.5"/>
            <circle cx="16.5" cy="14.5" r="1.5"/>
          </svg>
        </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })

    if (driverRef.current) {
      driverRef.current.setLatLng([dLat, dLng])
    } else {
      driverRef.current = L.marker([dLat, dLng], { icon: carIcon }).addTo(map)
    }

    // Fetch OSRM route
    const routePoints = await fetchRoute(dLat, dLng)

    if (routePoints.length > 0) {
      if (routeRef.current) {
        routeRef.current.setLatLngs(routePoints)
      } else {
        routeRef.current = L.polyline(routePoints, {
          color: '#E8703A',
          weight: 4,
          opacity: 0.85,
        }).addTo(map)
      }
    }

    // Fit map to show both driver and pickup
    const bounds: [number, number][] = [[dLat, dLng], [pickupLat, pickupLng]]
    map.fitBounds(bounds, { padding: [50, 50] })
  }

  // Update driver position + route when coords change
  useEffect(() => {
    if (!mapInst.current || !driverCoords) return

    const update = async () => {
      const L = (await import('leaflet')).default
      await updateDriverAndRoute(L, mapInst.current!, driverCoords.lat, driverCoords.lng)
    }

    update()
  }, [driverCoords])

  const googleMapsUrl = driverCoords
    ? `https://www.google.com/maps/dir/${driverCoords.lat},${driverCoords.lng}/${pickupLat},${pickupLng}`
    : `https://www.google.com/maps/search/?api=1&query=${pickupLat},${pickupLng}`

  return (
    <div className="relative w-full h-full">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="w-full h-full" />

      {/* ETA + distance overlay */}
      {(eta || dist) && (
        <div className="absolute top-3 left-3 flex gap-2 z-[1000]">
          {dist && (
            <div className="bg-white/95 rounded-xl px-3 py-1.5 shadow-md text-xs font-semibold text-gray-700">
              {dist}
            </div>
          )}
          {eta && (
            <div className="bg-sunset/90 rounded-xl px-3 py-1.5 shadow-md text-xs font-semibold text-white">
              ~{eta}
            </div>
          )}
        </div>
      )}

      {/* Open in Google Maps button */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 shadow-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        Navigasi Google Maps
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}
