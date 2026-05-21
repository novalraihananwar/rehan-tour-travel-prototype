import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { tourPackages } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()
  try {
    // Bookings stats
    const { data: bookings } = await supabase
      .from('bookings')
      .select('code, name, total_usd, status, created_at, package_title, payment_method, guests')

    const totalBookings  = bookings?.length || 0
    // BUG-7: sertakan status assigned dan dispatched dalam confirmed count
    const confirmedCount = bookings?.filter(b => ['confirmed', 'assigned', 'dispatched', 'on-trip', 'completed'].includes(b.status)).length || 0
    const pendingCount   = bookings?.filter(b => b.status === 'pending').length || 0
    const totalRevenue   = bookings?.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (Number(b.total_usd) || 0), 0) || 0

    // Today WIB
    const wibOffset = 7 * 60 * 60 * 1000
    const todayWIB  = new Date(Date.now() + wibOffset)
    todayWIB.setUTCHours(0, 0, 0, 0)
    const todayISO  = new Date(todayWIB.getTime() - wibOffset).toISOString()

    const todayBookings = bookings?.filter(b => b.created_at >= todayISO).length || 0
    const todayRevenue  = bookings
      ?.filter(b => b.created_at >= todayISO && b.status !== 'cancelled')
      .reduce((s, b) => s + (Number(b.total_usd) || 0), 0) || 0

    // Active drivers from Supabase (last 30 min) — NOT in-memory
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { data: locations } = await supabase
      .from('driver_locations')
      .select('driver_name, status, recorded_at')
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })

    // Deduplicate: latest per driver
    const seen = new Set<string>()
    const latestDrivers = (locations || []).filter(row => {
      if (seen.has(row.driver_name)) return false
      seen.add(row.driver_name)
      return true
    })
    const driversOnTrip = latestDrivers.filter(d => ['on-trip', 'en-route'].includes(d.status)).length
    const driversAvail  = latestDrivers.filter(d => ['available', 'standby'].includes(d.status)).length

    // Package stats
    const packageStats = Object.fromEntries(
      tourPackages.map(p => {
        const pkgBookings = bookings?.filter(b => b.package_title === p.title) || []
        return [p.slug, {
          bookings: pkgBookings.length,
          revenue:  pkgBookings.reduce((s, b) => s + (Number(b.total_usd) || 0), 0),
        }]
      })
    )

    // Recent bookings — sorted newest first
    const recent = [...(bookings || [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    return NextResponse.json({
      totalBookings, confirmedCount, pendingCount,
      totalRevenue, todayBookings, todayRevenue,
      driversOnTrip, driversAvail, totalDrivers: latestDrivers.length,
      totalGuests: bookings?.reduce((s, b) => s + (Number(b.guests) || 0), 0) || 0,
      packageStats, recentBookings: recent,
    })
  } catch {
    return NextResponse.json({
      totalBookings: 0, confirmedCount: 0, pendingCount: 0,
      totalRevenue: 0, todayBookings: 0, todayRevenue: 0,
      driversOnTrip: 0, driversAvail: 0, totalDrivers: 0,
      packageStats: {}, recentBookings: [],
    })
  }
}
