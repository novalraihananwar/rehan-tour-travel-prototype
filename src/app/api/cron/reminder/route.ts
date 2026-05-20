import { NextRequest, NextResponse } from 'next/server'

// Vercel Cron Job — runs daily at 08:00 WIB (01:00 UTC)
// Add to vercel.json: { "crons": [{ "path": "/api/cron/reminder", "schedule": "0 1 * * *" }] }

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron (in production)
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // In production with a real DB, query bookings departing tomorrow
  // For now: placeholder showing the structure
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  // TODO: Replace with real DB query
  // const bookings = await db.booking.findMany({ where: { date: tomorrowStr, status: 'confirmed' } })

  const mockBookings: Array<{
    name: string; whatsapp: string; package: string; date: string
    pickupTime: string; pickupLocation: string; driverName: string; driverPhone: string
  }> = []

  let sent = 0

  for (const booking of mockBookings) {
    // Send WA reminder via Fonnte API (plug in your Fonnte token)
    // await sendWhatsApp(booking.whatsapp, buildReminderMessage(booking))
    sent++
  }

  return NextResponse.json({
    ok: true,
    date: tomorrowStr,
    remindersSent: sent,
    message: `Processed ${sent} H-1 reminders for ${tomorrowStr}`,
  })
}

function buildReminderMessage(booking: {
  name: string
  package: string
  date: string
  pickupTime: string
  pickupLocation: string
  driverName: string
  driverPhone: string
}) {
  return `Halo ${booking.name}! 👋

Ini pengingat dari Rehan Tour & Travel.

*Trip kamu besok sudah siap!* 🌋

📦 Paket: ${booking.package}
📅 Tanggal: ${booking.date}
⏰ Penjemputan: ${booking.pickupTime}
📍 Lokasi jemput: ${booking.pickupLocation}

🚗 Driver: ${booking.driverName}
📞 Kontak driver: +${booking.driverPhone}

*Tips persiapan:*
- Bawa jaket tebal (suhu Bromo bisa 5–10°C)
- Sepatu tertutup
- Charge HP penuh
- Sarapan sebelum jemput jika memungkinkan

Sampai jumpa besok! 🙏
*Tim Rehan Tour & Travel*`
}

// Fonnte WA sender (uncomment & add FONNTE_TOKEN to env when ready)
// async function sendWhatsApp(target: string, message: string) {
//   await fetch('https://api.fonnte.com/send', {
//     method: 'POST',
//     headers: { Authorization: process.env.FONNTE_TOKEN! },
//     body: new URLSearchParams({ target, message, countryCode: '62' }),
//   })
// }
