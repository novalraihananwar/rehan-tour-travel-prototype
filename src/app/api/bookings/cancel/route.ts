import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { code, reason } = await req.json()
    if (!code) return NextResponse.json({ error: 'code wajib' }, { status: 400 })

    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
    }

    if (!['confirmed', 'pending'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking dengan status '${booking.status}' tidak bisa dibatalkan` },
        { status: 400 }
      )
    }

    const { error: updateErr } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason || null,
      })
      .eq('code', code)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // Fire-and-forget email notification
    if (booking.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rehantour.id'
      fetch(`${appUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-action': 'cancel-email' },
        body: JSON.stringify({ code, email: booking.email, name: booking.name, package_title: booking.package_title }),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, code })
  } catch (e) {
    console.error('[cancel POST]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
