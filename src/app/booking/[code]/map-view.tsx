'use client'

import { useEffect, useRef } from 'react'

interface Props {
  location: { lat: number; lng: number; status: string } | null
  bookingCode: string
}

// East Java → Bali route waypoints for reference line
const ROUTE_WAYPOINTS: [number, number][] = [
  [-7.2754, 112.7422], // Surabaya
  [-7.9797, 112.6305], // Malang
  [-8.2348, 114.3667], // Banyuwangi
  [-8.4561, 115.2216], // Bali
]

export default function MapView({ location, bookingCode }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapInst    = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)
  const markerRef  = useRef<ReturnType<typeof import('leaflet')['marker']> | null>(null)
  const circleRef  = useRef<ReturnType<typeof import('leaflet')['circle']> | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return

    let L: typeof import('leaflet')

    const init = async () => {
      L = (await import('leaflet')).default

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [-7.8, 113.5],
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Route reference line
      L.polyline(ROUTE_WAYPOINTS, {
        color: '#E8703A',
        weight: 2,
        opacity: 0.4,
        dashArray: '6 4',
      }).addTo(map)

      // Route waypoint markers
      ROUTE_WAYPOINTS.forEach(([lat, lng], i) => {
        const labels = ['Surabaya', 'Malang', 'Banyuwangi', 'Bali']
        L.circleMarker([lat, lng], {
          radius: 5,
          fillColor: '#D4A843',
          color: '#0A0A0A',
          weight: 2,
          fillOpacity: 0.8,
        }).bindTooltip(labels[i], { permanent: false, direction: 'top' }).addTo(map)
      })

      mapInst.current = map
    }

    init()

    return () => {
      if (mapInst.current) {
        mapInst.current.remove()
        mapInst.current = null
      }
    }
  }, [])

  // Update driver marker when location changes
  useEffect(() => {
    if (!mapInst.current || !location) return

    const updateMarker = async () => {
      const L = (await import('leaflet')).default

      const driverIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;">
            <div style="
              width: 44px; height: 44px;
              background: linear-gradient(135deg, #E8703A, #D4A843);
              border: 3px solid white;
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 16px rgba(232,112,58,0.5);
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/>
                <circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
            <div style="
              position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
              width: 8px; height: 8px;
              background: #E8703A;
              border-radius: 50%;
              animation: ping 1s cubic-bezier(0,0,.2,1) infinite;
            "></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })

      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng])
      } else {
        markerRef.current = L.marker([location.lat, location.lng], { icon: driverIcon })
          .addTo(mapInst.current!)
          .bindPopup('Driver sedang di sini', { maxWidth: 160 })
      }

      // Accuracy circle
      if (circleRef.current) {
        circleRef.current.setLatLng([location.lat, location.lng])
      } else {
        circleRef.current = L.circle([location.lat, location.lng], {
          radius: 200,
          fillColor: '#E8703A',
          fillOpacity: 0.08,
          color: '#E8703A',
          weight: 1,
          opacity: 0.3,
        }).addTo(mapInst.current!)
      }

      mapInst.current!.setView([location.lat, location.lng], 14, { animate: true })
    }

    updateMarker()
  }, [location])

  return (
    <div ref={mapRef} className="w-full h-full" />
  )
}
