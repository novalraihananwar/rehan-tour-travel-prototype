import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { pusherServer } from '@/lib/pusher'
import { sendWhatsApp, msgDriverAccepted } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { bookingCode, action, driverName } = await req.json()

    if (!bookingCode || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (action === 'accept') {
      // Fetch booking to get customer whatsapp
      const { data: booking } = await supabase
        .from('bookings').select('whatsapp, name').eq('code', bookingCode).single()

      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('code', bookingCode)

      // WhatsApp to customer
      if (booking?.whatsapp) {
        sendWhatsApp(booking.whatsapp, msgDriverAccepted({
          customerName: booking.name,
          driverName,
          code: bookingCode,
        })).catch(() => {})
      }

      // Notify admin via Pusher
      await pusherServer.trigger('admin-drivers', 'booking-accepted', {
        bookingCode, driverName, timestamp: Date.now(),
      })

      return NextResponse.json({ ok: true, action: 'accepted' })
    }

    if (action === 'reject') {
      // Reset booking back to pending, clear driver assignment
      await supabase
        .from('bookings')
        .update({ status: 'pending', driver_name: null, dispatched_at: null })
        .eq('code', bookingCode)

      // Notify admin
      await pusherServer.trigger('admin-drivers', 'booking-rejected', {
        bookingCode, driverName, timestamp: Date.now(),
      })

      return NextResponse.json({ ok: true, action: 'rejected' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error('driver/respond error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
