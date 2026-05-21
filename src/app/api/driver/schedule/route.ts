import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const driverName = searchParams.get('driverName')?.trim()

  if (!driverName) {
    return NextResponse.json({ error: 'driverName wajib diisi.' }, { status: 400 })
  }

  // Today in WIB (UTC+7)
  const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const todayWib = nowWib.toISOString().slice(0, 10)

  try {
    const admin = getSupabaseAdmin()

    const { data, error } = await admin
      .from('bookings')
      .select('code, package_title, date, pickup_time, pickup_name, guests, status')
      .eq('driver_name', driverName)
      .gte('date', todayWib)
      .in('status', ['assigned', 'dispatched', 'confirmed'])
      .order('date', { ascending: true })

    if (error) {
      console.error('[driver/schedule] supabase error:', error)
      return NextResponse.json({ error: 'Gagal mengambil jadwal.' }, { status: 500 })
    }

    const trips = (data ?? []).map(row => ({
      code: row.code as string,
      packageTitle: row.package_title as string,
      date: row.date as string,
      pickupTime: (row.pickup_time as string) ?? '',
      pickupName: (row.pickup_name as string) ?? '',
      guests: (row.guests as number) ?? 0,
      status: row.status as string,
    }))

    return NextResponse.json({ ok: true, trips })
  } catch (err) {
    console.error('[driver/schedule]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
