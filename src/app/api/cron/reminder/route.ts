import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendWhatsApp, msgH1Customer, msgH1Driver } from '@/lib/whatsapp'
import { sendEmail, emailH1Reminder } from '@/lib/email'

// Vercel Cron — runs daily at 08:00 WIB (01:00 UTC)
// vercel.json: { "crons": [{ "path": "/api/cron/reminder", "schedule": "0 1 * * *" }] }

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
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

  // Fetch drivers table for phone numbers
  const { data: driversDb } = await supabase
    .from('drivers').select('name, phone')

  const driverPhoneMap: Record<string, string> = {}
  for (const d of (driversDb || [])) {
    if (d.name && d.phone) driverPhoneMap[d.name] = d.phone
  }

  const results = { total: bookings?.length || 0, unassigned: 0, waSent: 0, waFailed: 0, emailSent: 0 }

  for (const b of (bookings || [])) {
    if (!b.driver_name) results.unassigned++

    const params = {
      name:         String(b.name || ''),
      packageTitle: String(b.package_title || ''),
      date:         String(b.date || ''),
      pickupTime:   String(b.pickup_time || ''),
      pickupName:   String(b.pickup_name || ''),
      driverName:   b.driver_name ? String(b.driver_name) : null,
      code:         String(b.code || ''),
    }

    // Send WA to customer
    if (b.whatsapp) {
      const sent = await sendWhatsApp(String(b.whatsapp), msgH1Customer(params))
      sent ? results.waSent++ : results.waFailed++
    }

    // Send email H-1 reminder to customer (non-blocking)
    if (b.email) {
      const { subject, html } = emailH1Reminder({
        name:        params.name,
        code:        params.code,
        packageTitle: params.packageTitle,
        date:        params.date,
        pickupTime:  params.pickupTime,
        pickupName:  params.pickupName,
        driverName:  params.driverName,
        guests:      Number(b.guests) || 1,
      })
      sendEmail({ to: String(b.email), subject, html })
        .then(ok => { if (ok) results.emailSent++ })
        .catch(() => {})
    }

    // Send to driver if assigned and phone available
    if (b.driver_name) {
      const driverPhone = driverPhoneMap[b.driver_name]
      if (driverPhone) {
        const sent = await sendWhatsApp(driverPhone, msgH1Driver({
          driverName:   String(b.driver_name),
          customerName: String(b.name || ''),
          packageTitle: String(b.package_title || ''),
          date:         String(b.date || ''),
          pickupTime:   String(b.pickup_time || ''),
          pickupName:   String(b.pickup_name || ''),
          guests:       Number(b.guests) || 1,
          code:         String(b.code || ''),
        }))
        sent ? results.waSent++ : results.waFailed++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    date: tomorrowStr,
    bookingsFound: results.total,
    unassigned: results.unassigned,
    waSent: results.waSent,
    waFailed: results.waFailed,
    emailSent: results.emailSent,
    message: `${results.total} bookings for ${tomorrowStr}. Sent ${results.waSent} WA messages, ${results.emailSent} emails.`,
  })
}

