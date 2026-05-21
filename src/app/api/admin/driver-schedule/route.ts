import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()
  try {
    // Get bookings with assigned drivers from the past 7 days to next 90 days
    const from = new Date()
    from.setDate(from.getDate() - 7)
    const to = new Date()
    to.setDate(to.getDate() + 90)

    const { data: bookings } = await supabase
      .from('bookings')
      .select('code, package_title, date, pickup_time, guests, status, driver_name, name')
      .in('status', ['assigned', 'dispatched', 'confirmed', 'on-trip'])
      .gte('date', from.toISOString().split('T')[0])
      .lte('date', to.toISOString().split('T')[0])
      .not('driver_name', 'is', null)
      .order('date', { ascending: true })

    // Group by driver_name
    const schedule: Record<string, Array<{
      code: string; packageTitle: string; date: string
      pickupTime: string; guests: number; status: string; customerName: string
    }>> = {}

    for (const b of (bookings || [])) {
      const name = b.driver_name
      if (!name) continue
      if (!schedule[name]) schedule[name] = []
      schedule[name].push({
        code:         b.code,
        packageTitle: b.package_title,
        date:         b.date,
        pickupTime:   b.pickup_time || '—',
        guests:       b.guests,
        status:       b.status,
        customerName: b.name,
      })
    }

    return NextResponse.json(schedule)
  } catch (e) {
    console.error('driver-schedule error:', e)
    return NextResponse.json({})
  }
}
