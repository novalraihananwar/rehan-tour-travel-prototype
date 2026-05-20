import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { driverStateStore } from '@/lib/driver-state'
import { tourPackages } from '@/lib/data'

export async function GET() {
  try {
    // Bookings stats from Supabase
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_usd, status, created_at, package_title, payment_method')

    const totalBookings   = bookings?.length || 0
    const confirmedCount  = bookings?.filter(b => b.status === 'confirmed' || b.status === 'on-trip' || b.status === 'completed').length || 0
    const pendingCount    = bookings?.filter(b => b.status === 'pending').length || 0
    const totalRevenue    = bookings?.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_usd || 0), 0) || 0

    // Today's bookings (UTC midnight WIB = UTC+7)
    const wibOffset = 7 * 60 * 60 * 1000
    const todayWIB  = new Date(Date.now() + wibOffset)
    todayWIB.setUTCHours(0, 0, 0, 0)
    const todayISO  = new Date(todayWIB.getTime() - wibOffset).toISOString()

    const todayBookings = bookings?.filter(b => b.created_at >= todayISO).length || 0
    const todayRevenue  = bookings?.filter(b => b.created_at >= todayISO && b.status !== 'cancelled')
      .reduce((s, b) => s + (b.total_usd || 0), 0) || 0

    // Active drivers from in-memory store
    const activeDrivers = Array.from(driverStateStore.values()).filter(
      d => Date.now() - d.updatedAt < 30 * 60 * 1000
    )
    const driversOnTrip = activeDrivers.filter(d => d.status === 'on-trip' || d.status === 'en-route').length
    const driversAvail  = activeDrivers.filter(d => d.status === 'available' || d.status === 'standby').length

    // Package stats
    const packageStats = Object.fromEntries(
      tourPackages.map(p => {
        const pkgBookings = bookings?.filter(b => b.package_title === p.title) || []
        return [p.slug, {
          bookings: pkgBookings.length,
          revenue: pkgBookings.reduce((s, b) => s + (b.total_usd || 0), 0),
        }]
      })
    )

    // Recent bookings
    const recent = bookings?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5) || []

    return NextResponse.json({
      totalBookings,
      confirmedCount,
      pendingCount,
      totalRevenue,
      todayBookings,
      todayRevenue,
      driversOnTrip,
      driversAvail,
      totalDrivers: activeDrivers.length,
      packageStats,
      recentBookings: recent,
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
