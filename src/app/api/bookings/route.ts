import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        code:            body.code,
        package_id:      body.packageId,
        package_title:   body.packageTitle,
        date:            body.date || null,
        guests:          body.guests,
        pickup_name:     body.pickupName || null,
        pickup_address:  body.pickupAddress || null,
        pickup_fee_usd:  body.pickupFeeUsd || 0,
        pickup_custom:   body.pickupIsCustom || false,
        name:            body.name,
        email:           body.email,
        whatsapp:        body.whatsapp,
        special_request: body.specialRequest || null,
        payment_method:  body.paymentMethod,
        total_usd:       body.totalUsd,
        status:          'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, booking: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !data) return NextResponse.json(null)
  return NextResponse.json(data)
}
