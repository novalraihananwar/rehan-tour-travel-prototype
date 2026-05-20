import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabase } from '@/lib/supabase'
import { driverStateStore } from '@/lib/driver-state'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingCode, lat, lng, status, driverName, driverId, vehicle } = body

    if (!bookingCode || !lat || !lng) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const data = { lat, lng, status: status || 'en-route', timestamp: Date.now(), driverName, vehicle }

    // Save to Supabase (includes vehicle so admin map can show it)
    try {
      await supabase.from('driver_locations').insert({
        booking_code: bookingCode,
        driver_id:   driverId || null,
        driver_name: driverName || null,
        vehicle:     vehicle || null,
        lat, lng,
        status: status || 'en-route',
      })
    } catch { /* schema not yet created — continue */ }

    // Update in-memory driver state store
    if (driverName) {
      const existing = driverStateStore.get(driverName)
      driverStateStore.set(driverName, {
        driverId: existing?.driverId || null,
        driverName,
        vehicle: vehicle || existing?.vehicle || '',
        lat, lng,
        status: status || 'en-route',
        bookingCode: bookingCode || null,
        customerName: existing?.customerName || null,
        pickupName: existing?.pickupName || null,
        pickupLat: existing?.pickupLat || null,
        pickupLng: existing?.pickupLng || null,
        updatedAt: Date.now(),
      })
    }

    // Broadcast to booking-specific channel (customer tracker)
    await pusherServer.trigger(`booking-${bookingCode}`, 'location-update', data)

    // Broadcast to admin channel (all drivers map)
    await pusherServer.trigger('admin-drivers', 'driver-update', {
      driverName, vehicle, lat, lng, status, bookingCode, timestamp: Date.now(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  // Get latest location from Supabase
  const { data } = await supabase
    .from('driver_locations')
    .select('*')
    .eq('booking_code', code)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return NextResponse.json(null)

  return NextResponse.json({
    lat: data.lat,
    lng: data.lng,
    status: data.status,
    timestamp: new Date(data.recorded_at).getTime(),
    driverName: data.driver_name,
  })
}
