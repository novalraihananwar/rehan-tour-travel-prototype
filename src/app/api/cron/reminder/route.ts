import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Vercel Cron — runs daily at 08:00 WIB (01:00 UTC)
// vercel.json: { "crons": [{ "path": "/api/cron/reminder", "schedule": "0 1 * * *" }] }

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Tomorrow in WIB (UTC+7)
  const WIB = 7 * 60 * 60 * 1000
  const tomorrowWIB = new Date(Date.now() + WIB)
  tomorrowWIB.setUTCDate(tomorrowWIB.getUTCDate() + 1)
  tomorrowWIB.setUTCHours(0, 0, 0, 0)
  const tomorrowStr = `${tomorrowWIB.getUTCFullYear()}-${String(tomorrowWIB.getUTCMonth() + 1).padStart(2, '0')}-${String(tomorrowWIB.getUTCDate()).padStart(2, '0')}`

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', tomorrowStr)
    .in('status', ['confirmed', 'assigned', 'dispatched'])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { total: bookings?.length || 0, unassigned: 0, waLinks: [] as string[] }

  for (const b of (bookings || [])) {
    if (!b.driver_name) results.unassigned++

    // Build WhatsApp reminder link for customer
    const customerMsg = buildCustomerReminder(b)
    const waCustomer = `https://wa.me/${String(b.whatsapp).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customerMsg)}`
    results.waLinks.push(waCustomer)
  }

  return NextResponse.json({
    ok: true,
    date: tomorrowStr,
    bookingsFound: results.total,
    unassigned: results.unassigned,
    waLinks: results.waLinks,
    message: `${results.total} bookings for ${tomorrowStr}. ${results.unassigned} still unassigned.`,
  })
}

function buildCustomerReminder(b: Record<string, unknown>): string {
  const name        = String(b.name || 'Traveler')
  const pkg         = String(b.package_title || '—')
  const date        = String(b.date || '—')
  const pickupTime  = String(b.pickup_time || '—')
  const pickup      = String(b.pickup_name || '—')
  const driver      = b.driver_name ? String(b.driver_name) : null
  const code        = String(b.code || '')

  return `Halo ${name.split(' ')[0]}! 👋

Pengingat dari *Rehan Tour & Travel* — trip kamu besok sudah siap! 🌋

📦 *Paket:* ${pkg}
📅 *Tanggal:* ${date}
⏰ *Jam Jemput:* ${pickupTime} WIB
📍 *Lokasi Jemput:* ${pickup}
${driver ? `🚗 *Driver:* ${driver}` : '🚗 *Driver:* Segera dikonfirmasi'}
🎫 *Kode Booking:* ${code}

*Tips persiapan:*
- Bawa jaket tebal (suhu bisa 5–10°C di pegunungan)
- Sepatu tertutup & nyaman
- Charge HP penuh
- Sarapan sebelum waktu jemput jika memungkinkan

Track perjalananmu: https://rehan-tour-travel-prototype.vercel.app/booking/${code}

Sampai jumpa besok! 🙏
*Tim Rehan Tour & Travel*`
}
