import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { pusherServer } from '@/lib/pusher'
import { driverChannel } from '@/lib/pickup-times'
import { sendWhatsApp, msgDriverDispatched } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { bookingCode, driverName, driverVehicle, dispatch } = await req.json()

    if (!bookingCode || !driverName) {
      return NextResponse.json({ error: 'Missing bookingCode or driverName' }, { status: 400 })
    }

    // Fetch full booking details for the driver notification
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('code', bookingCode)
      .single()

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const newStatus = dispatch ? 'dispatched' : 'assigned'

    // Update booking with driver assignment
    const updatePayload: Record<string, unknown> = {
      driver_name: driverName,
      status:      newStatus,
    }
    if (dispatch) updatePayload.dispatched_at = new Date().toISOString()

    await supabase.from('bookings').update(updatePayload).eq('code', bookingCode)

    // If dispatching: notify driver via Pusher + WhatsApp to customer
    if (dispatch) {
      // WhatsApp to customer
      if (booking.whatsapp) {
        sendWhatsApp(booking.whatsapp, msgDriverDispatched({
          customerName: booking.name,
          driverName,
          packageTitle: booking.package_title,
          date:         booking.date || '—',
          pickupTime:   booking.pickup_time || '',
          pickupName:   booking.pickup_name || '—',
          code:         bookingCode,
        })).catch(() => {})
      }

      const channel = driverChannel(driverName)
      await pusherServer.trigger(channel, 'new-booking', {
        bookingCode,
        packageTitle:  booking.package_title,
        customerName:  booking.name,
        guests:        booking.guests,
        pickupName:    booking.pickup_name || '',
        pickupAddress: booking.pickup_address || '',
        date:          booking.date || '',
        pickupTime:    booking.pickup_time || '',
        totalUsd:      booking.total_usd,
        timestamp:     Date.now(),
      })
    }

    return NextResponse.json({ ok: true, status: newStatus, dispatched: !!dispatch })
  } catch (e) {
    console.error('assign-driver error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
