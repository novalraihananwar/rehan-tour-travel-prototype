import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: raw } = await supabase
      .from('bookings')
      .select('total_usd, status, created_at, guests, package_title, payment_method')

    const bookings = (raw || []).filter(b => b.status !== 'cancelled')

    // ── Monthly aggregation ──────────────────────────────────────────────
    const monthMap: Record<string, { revenue: number; bookings: number; passengers: number }> = {}
    bookings.forEach(b => {
      const d   = new Date(b.created_at)
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      if (!monthMap[key]) monthMap[key] = { revenue: 0, bookings: 0, passengers: 0 }
      monthMap[key].revenue   += Number(b.total_usd) || 0
      monthMap[key].bookings  += 1
      monthMap[key].passengers += Number(b.guests) || 0
    })

    const monthlyData = Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, d]) => {
        const [y, m] = key.split('-')
        const label  = new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'short' })
        return {
          month:      label,
          revenue:    Math.round(d.revenue),
          bookings:   d.bookings,
          passengers: d.passengers,
          avgValue:   d.bookings > 0 ? Math.round(d.revenue / d.bookings) : 0,
        }
      })

    // ── Weekly trend (last 8 weeks) ──────────────────────────────────────
    const now       = Date.now()
    const MS_WEEK   = 7 * 24 * 60 * 60 * 1000
    const weekRev: Record<number, number> = {}
    bookings.forEach(b => {
      const weeksAgo = Math.floor((now - new Date(b.created_at).getTime()) / MS_WEEK)
      if (weeksAgo < 8) weekRev[weeksAgo] = (weekRev[weeksAgo] || 0) + (Number(b.total_usd) || 0)
    })

    const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
      const weeksAgo = 7 - i
      const d = new Date(now - weeksAgo * MS_WEEK)
      return {
        week:    `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('en-US', { month: 'short' })}`,
        revenue: Math.round(weekRev[weeksAgo] || 0),
      }
    })

    // ── Package performance ───────────────────────────────────────────────
    const pkgMap: Record<string, { revenue: number; bookings: number }> = {}
    bookings.forEach(b => {
      const full  = (b.package_title || 'Custom Trip').trim()
      const name  = full.length > 18 ? full.substring(0, 16) + '…' : full
      if (!pkgMap[name]) pkgMap[name] = { revenue: 0, bookings: 0 }
      pkgMap[name].revenue  += Number(b.total_usd) || 0
      pkgMap[name].bookings += 1
    })

    const packageRevenueData = Object.entries(pkgMap)
      .map(([name, d]) => ({ name, revenue: Math.round(d.revenue), bookings: d.bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8)

    // ── Payment method breakdown ─────────────────────────────────────────
    const payMap: Record<string, number> = {}
    bookings.forEach(b => { const m = b.payment_method || 'other'; payMap[m] = (payMap[m] || 0) + 1 })
    const total = bookings.length || 1
    const paymentData = Object.entries(payMap)
      .map(([method, count]) => ({
        method:     method.replace(/-/g, ' '),
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // ── Totals ───────────────────────────────────────────────────────────
    const totalRevenue    = bookings.reduce((s, b) => s + (Number(b.total_usd) || 0), 0)
    const totalBookings   = bookings.length
    const totalPassengers = bookings.reduce((s, b) => s + (Number(b.guests) || 0), 0)
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    return NextResponse.json({
      monthlyData, weeklyTrend, packageRevenueData, paymentData,
      totalRevenue:    Math.round(totalRevenue),
      totalBookings,
      totalPassengers,
      avgBookingValue: Math.round(avgBookingValue),
    })
  } catch (e) {
    console.error('Analytics API error:', e)
    return NextResponse.json({
      monthlyData: [], weeklyTrend: [], packageRevenueData: [], paymentData: [],
      totalRevenue: 0, totalBookings: 0, totalPassengers: 0, avgBookingValue: 0,
    })
  }
}
