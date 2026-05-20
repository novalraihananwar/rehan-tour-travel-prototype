import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

// In-memory store for driver locations (per booking code)
const locationStore = new Map<string, {
  lat: number
  lng: number
  status: string
  timestamp: number
  driverName?: string
}>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingCode, lat, lng, status, driverName } = body

    if (!bookingCode || !lat || !lng) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const data = { lat, lng, status: status || 'en-route', timestamp: Date.now(), driverName }
    locationStore.set(bookingCode, data)

    await pusherServer.trigger(`booking-${bookingCode}`, 'location-update', data)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const data = locationStore.get(code)
  return NextResponse.json(data || null)
}
