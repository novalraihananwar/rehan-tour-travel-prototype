import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get latest location per driver from last 30 minutes
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('driver_locations')
      .select('*')
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })

    if (error || !data) return NextResponse.json([])

    // Deduplicate: keep only latest record per driver_name
    const seen = new Set<string>()
    const latest = data.filter(row => {
      const key = row.driver_name || `unknown-${row.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const drivers = latest.map(row => ({
      driverName:  row.driver_name || 'Unknown',
      vehicle:     row.vehicle || '',
      lat:         row.lat,
      lng:         row.lng,
      status:      row.status || 'available',
      bookingCode: row.booking_code !== 'STANDBY' ? row.booking_code : null,
      customerName: null,
      pickupName:  null,
      pickupLat:   null,
      pickupLng:   null,
      updatedAt:   new Date(row.recorded_at).getTime(),
    }))

    return NextResponse.json(drivers)
  } catch {
    return NextResponse.json([])
  }
}
