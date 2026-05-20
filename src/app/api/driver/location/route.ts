import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingCode, lat, lng, status, driverName, driverId } = body

    if (!bookingCode || !lat || !lng) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const data = { lat, lng, status: status || 'en-route', timestamp: Date.now(), driverName }

    // Save to Supabase
    await supabase.from('driver_locations').insert({
      booking_code: bookingCode,
      driver_id: driverId || null,
      driver_name: driverName || null,
      lat,
      lng,
      status: status || 'en-route',
    })

    // Broadcast via Pusher for real-time
    await pusherServer.trigger(`booking-${bookingCode}`, 'location-update', data)

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
