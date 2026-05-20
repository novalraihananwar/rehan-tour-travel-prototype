'use client'

import { useEffect, useRef } from 'react'

interface Props {
  driverCoords: { lat: number; lng: number } | null
  pickupLat: number
  pickupLng: number
  pickupName: string
}

export default function RouteMapMini({ driverCoords, pickupLat, pickupLng, pickupName }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapInst    = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)
  const driverRef  = useRef<ReturnType<typeof import('leaflet')['marker']> | null>(null)
  const polylineRef = useRef<ReturnType<typeof import('leaflet')['polyline']> | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return

    const init = async () => {
      const L = (await import('leaflet')).default
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl

      const center: [number, number] = driverCoords
        ? [(driverCoords.lat + pickupLat) / 2, (driverCoords.lng + pickupLng) / 2]
        : [pickupLat, pickupLng]

      const map = L.map(mapRef.current!, {
        center, zoom: 12,
        zoomControl: false, attributionControl: false,
        dragging: false, scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)

      // Pickup marker (destination)
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:#E8703A;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(232,112,58,0.5);"></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32],
      })
      L.marker([pickupLat, pickupLng], { icon: pickupIcon })
        .addTo(map)
        .bindTooltip(pickupName, { permanent: true, direction: 'top', className: 'leaflet-tooltip-custom' })

      mapInst.current = map
    }

    init()
    return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null } }
  }, [])

  // Update driver marker in real-time
  useEffect(() => {
    if (!mapInst.current || !driverCoords) return

    const update = async () => {
      const L = (await import('leaflet')).default

      const driverIcon = L.divIcon({
        className: '',
        html: `
          <div style="width:36px;height:36px;background:white;border:3px solid #E8703A;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(232,112,58,0.4);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#E8703A">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
            </svg>
          </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18],
      })

      if (driverRef.current) {
        driverRef.current.setLatLng([driverCoords.lat, driverCoords.lng])
      } else {
        driverRef.current = L.marker([driverCoords.lat, driverCoords.lng], { icon: driverIcon }).addTo(mapInst.current!)
      }

      // Draw/update route line
      const points: [number, number][] = [
        [driverCoords.lat, driverCoords.lng],
        [pickupLat, pickupLng],
      ]
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(points)
      } else {
        polylineRef.current = L.polyline(points, { color: '#E8703A', weight: 3, opacity: 0.7, dashArray: '8 4' }).addTo(mapInst.current!)
      }

      // Fit bounds to show both driver and pickup
      mapInst.current!.fitBounds(points, { padding: [40, 40] })
    }

    update()
  }, [driverCoords, pickupLat, pickupLng])

  return <div ref={mapRef} className="w-full h-full" />
}
