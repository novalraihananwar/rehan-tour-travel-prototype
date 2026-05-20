import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { driverStateStore } from '@/lib/driver-state'
import { tourPackages } from '@/lib/data'

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
  const { sheet } = params

  switch (sheet) {

    case 'penjualan': {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

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
      const drivers = Array.from(driverStateStore.values()).filter(
        d => Date.now() - d.updatedAt < 30 * 60 * 1000
      )

      const headers = ['Nama Driver', 'Kendaraan', 'Status', 'Booking Code', 'Lokasi Pickup', 'Lat', 'Lng', 'Update Terakhir']
      const rows = drivers.map(d => [
        d.driverName,
        d.vehicle,
        d.status,
        d.bookingCode || '-',
        d.pickupName || '-',
        d.lat?.toFixed(5) || '',
        d.lng?.toFixed(5) || '',
        d.updatedAt ? toWIBTime(new Date(d.updatedAt).toISOString()) : '',
      ])

      return new NextResponse(toCsv(headers, rows), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      })
    }

    case 'ringkasan': {
      const { data: bookings } = await supabase.from('bookings').select('total_usd, status, created_at, guests')

      const wibMidnight = new Date()
      wibMidnight.setUTCHours(0, 0, 0, 0)
      const todayISO = new Date(wibMidnight.getTime() - WIB).toISOString()

      const total     = bookings?.length || 0
      const confirmed = bookings?.filter(b => ['confirmed', 'on-trip', 'completed'].includes(b.status)).length || 0
      const pending   = bookings?.filter(b => b.status === 'pending').length || 0
      const revenue   = bookings?.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_usd || 0), 0) || 0
      const todayBook = bookings?.filter(b => b.created_at >= todayISO).length || 0
      const todayRev  = bookings?.filter(b => b.created_at >= todayISO && b.status !== 'cancelled').reduce((s, b) => s + (b.total_usd || 0), 0) || 0
      const totalGuests = bookings?.reduce((s, b) => s + (b.guests || 0), 0) || 0
      const driverOnline = driverStateStore.size

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
