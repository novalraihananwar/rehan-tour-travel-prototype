import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Latest location per driver (last 30 min)
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('driver_locations')
      .select('*')
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })

    if (error || !data) return NextResponse.json([])

    // Deduplicate: latest per driver
    const seen = new Set<string>()
    const latest = data.filter(row => {
      const key = row.driver_name || `unknown-${row.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Trip counts — distinct booking codes per driver (excluding STANDBY)
    const WIB = 7 * 60 * 60 * 1000
    const todayWIB = new Date(Date.now() + WIB)
    todayWIB.setUTCHours(0, 0, 0, 0)
    const todayISO = new Date(todayWIB.getTime() - WIB).toISOString()

    const monthWIB = new Date(Date.now() + WIB)
    monthWIB.setUTCDate(1); monthWIB.setUTCHours(0, 0, 0, 0)
    const monthISO = new Date(monthWIB.getTime() - WIB).toISOString()

    const { data: tripRows } = await supabase
      .from('driver_locations')
      .select('driver_name, booking_code, recorded_at')
      .neq('booking_code', 'STANDBY')
      .not('booking_code', 'is', null)

    // Aggregate: Set of booking codes per driver per period
    const tripMap: Record<string, { today: Set<string>; month: Set<string>; total: Set<string> }> = {}
    for (const row of (tripRows || [])) {
      const name = row.driver_name
      if (!name) continue
      if (!tripMap[name]) tripMap[name] = { today: new Set(), month: new Set(), total: new Set() }
      tripMap[name].total.add(row.booking_code)
      if (row.recorded_at >= monthISO) tripMap[name].month.add(row.booking_code)
      if (row.recorded_at >= todayISO) tripMap[name].today.add(row.booking_code)
    }

    const drivers = latest.map(row => {
      const counts = tripMap[row.driver_name] || { today: new Set(), month: new Set(), total: new Set() }
      return {
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
        tripsToday:  counts.today.size,
        tripsMonth:  counts.month.size,
        tripsTotal:  counts.total.size,
      }
    })

    return NextResponse.json(drivers)
  } catch {
    return NextResponse.json([])
  }
}
