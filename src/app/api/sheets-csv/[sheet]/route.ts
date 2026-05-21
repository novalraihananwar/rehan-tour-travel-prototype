import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { tourPackages } from '@/lib/data'

export const dynamic = 'force-dynamic'

// WIB = UTC+7
const WIB = 7 * 60 * 60 * 1000

function toWIBTime(iso: string) {
  const d = new Date(new Date(iso).getTime() + WIB)
  return `${String(d.getUTCHours()).padStart(2, '0')}.${String(d.getUTCMinutes()).padStart(2, '0')}`
}

function toWIBDate(iso: string) {
  const d = new Date(new Date(iso).getTime() + WIB)
  return `${d.getUTCDate().toString().padStart(2,'0')}/${(d.getUTCMonth()+1).toString().padStart(2,'0')}/${d.getUTCFullYear()}`
}

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers, ...rows].map(row => row.map(escape).join(',')).join('\n')
}

export async function GET(req: NextRequest, { params }: { params: { sheet: string } }) {
  const supabase = getSupabaseAdmin()
  const { sheet } = params

  switch (sheet) {

    case 'penjualan': {
      const { data: bookings, error: bErr, count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 999)

      if (bErr) console.error('[sheets-csv] penjualan error:', bErr.message)
      console.log('[sheets-csv] penjualan fetched:', bookings?.length, '/ count:', count)

      const headers = ['Kode', 'Tanggal', 'Jam', 'Nama Tamu', 'Paket', 'Tamu (pax)', 'Pickup', 'Total USD', 'Metode Bayar', 'Status']
      const rows = (bookings || []).map(b => [
        b.code || '',
        b.created_at ? toWIBDate(b.created_at) : '',
        b.created_at ? toWIBTime(b.created_at) : '',
        b.name || '',
        b.package_title || '',
        b.guests || '',
        b.pickup_name || '',
        b.total_usd || 0,
        b.payment_method || '',
        b.status || '',
      ])

      return new NextResponse(toCsv(headers, rows), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      })
    }

    case 'rekap-paket': {
      const { data: bookings } = await supabase.from('bookings').select('package_title, total_usd, status')

      const stats: Record<string, { count: number; revenue: number }> = {}
      ;(bookings || []).forEach(b => {
        if (!stats[b.package_title]) stats[b.package_title] = { count: 0, revenue: 0 }
        stats[b.package_title].count++
        if (b.status !== 'cancelled') stats[b.package_title].revenue += b.total_usd || 0
      })

      const headers = ['Nama Paket', 'Total Booking', 'Revenue (USD)', 'Tipe']
      const rows = tourPackages.map(p => [
        p.title,
        stats[p.title]?.count || 0,
        stats[p.title]?.revenue?.toFixed(2) || '0.00',
        p.type,
      ])

      return new NextResponse(toCsv(headers, rows), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      })
    }

    case 'driver-aktif': {
      const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data: locs } = await supabase
        .from('driver_locations')
        .select('*')
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: false })

      // Latest per driver
      const seenD = new Set<string>()
      const latestD = (locs || []).filter(row => {
        if (seenD.has(row.driver_name)) return false
        seenD.add(row.driver_name); return true
      })

      // Trip counts
      const WIBOffset = 7 * 60 * 60 * 1000
      const todayWIB = new Date(Date.now() + WIBOffset)
      todayWIB.setUTCHours(0, 0, 0, 0)
      const todayISO = new Date(todayWIB.getTime() - WIBOffset).toISOString()
      const monthWIB = new Date(Date.now() + WIBOffset)
      monthWIB.setUTCDate(1); monthWIB.setUTCHours(0, 0, 0, 0)
      const monthISO = new Date(monthWIB.getTime() - WIBOffset).toISOString()

      const { data: tripRows } = await supabase
        .from('driver_locations')
        .select('driver_name, booking_code, recorded_at')
        .neq('booking_code', 'STANDBY')
        .not('booking_code', 'is', null)

      const tripMap: Record<string, { today: Set<string>; month: Set<string>; total: Set<string> }> = {}
      for (const row of (tripRows || [])) {
        const n = row.driver_name; if (!n) continue
        if (!tripMap[n]) tripMap[n] = { today: new Set(), month: new Set(), total: new Set() }
        tripMap[n].total.add(row.booking_code)
        if (row.recorded_at >= monthISO) tripMap[n].month.add(row.booking_code)
        if (row.recorded_at >= todayISO) tripMap[n].today.add(row.booking_code)
      }

      const headers = ['Nama Driver', 'Kendaraan', 'Status', 'Booking Code', 'Lat', 'Lng', 'Update Terakhir', 'Trip Hari Ini', 'Trip Bulan Ini', 'Total Trip']
      const rows = latestD.map(d => {
        const tc = tripMap[d.driver_name] || { today: new Set(), month: new Set(), total: new Set() }
        return [
          d.driver_name,
          d.vehicle || '-',
          d.status,
          d.booking_code !== 'STANDBY' ? (d.booking_code || '-') : '-',
          d.lat?.toFixed(5) || '',
          d.lng?.toFixed(5) || '',
          d.recorded_at ? toWIBTime(d.recorded_at) : '',
          tc.today.size,
          tc.month.size,
          tc.total.size,
        ]
      })

      return new NextResponse(toCsv(headers, rows), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      })
    }

    case 'ringkasan': {
      const { data: bookings } = await supabase.from('bookings').select('total_usd, status, created_at, guests')

      const wibMidnight = new Date(Date.now() + WIB)
      wibMidnight.setUTCHours(0, 0, 0, 0)
      const todayISO = new Date(wibMidnight.getTime() - WIB).toISOString()

      const total     = bookings?.length || 0
      const confirmed = bookings?.filter(b => ['confirmed', 'on-trip', 'completed'].includes(b.status)).length || 0
      const pending   = bookings?.filter(b => b.status === 'pending').length || 0
      const revenue   = bookings?.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_usd || 0), 0) || 0
      const todayBook = bookings?.filter(b => b.created_at >= todayISO).length || 0
      const todayRev  = bookings?.filter(b => b.created_at >= todayISO && b.status !== 'cancelled').reduce((s, b) => s + (b.total_usd || 0), 0) || 0
      const totalGuests = bookings?.reduce((s, b) => s + (b.guests || 0), 0) || 0
      const sinceD = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data: driverLocs } = await supabase.from('driver_locations').select('driver_name').gte('recorded_at', sinceD)
      const driverOnline = new Set((driverLocs || []).map(d => d.driver_name)).size

      const headers = ['Metrik', 'Nilai']
      const rows = [
        ['Total Booking', total],
        ['Booking Confirmed', confirmed],
        ['Booking Pending', pending],
        ['Total Revenue (USD)', revenue.toFixed(2)],
        ['Booking Hari Ini', todayBook],
        ['Revenue Hari Ini (USD)', todayRev.toFixed(2)],
        ['Total Tamu', totalGuests],
        ['Driver Online', driverOnline],
        ['Update', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })],
      ]

      return new NextResponse(toCsv(headers, rows), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      })
    }

    default:
      return NextResponse.json({ error: `Sheet '${sheet}' not found. Available: penjualan, rekap-paket, driver-aktif, ringkasan` }, { status: 404 })
  }
}
