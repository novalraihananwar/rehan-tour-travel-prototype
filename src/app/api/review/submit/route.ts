import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { booking_code, rating, review_text, reviewer_name } = await req.json()

    if (!booking_code || !rating || !review_text) {
      return NextResponse.json({ error: 'booking_code, rating, dan review_text wajib diisi' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 })
    }

    if (review_text.trim().length < 20) {
      return NextResponse.json({ error: 'Review minimal 20 karakter' }, { status: 400 })
    }

    // Validasi booking exists
    const { data: booking } = await supabase
      .from('bookings')
      .select('code, package_title, name, status')
      .eq('code', booking_code)
      .maybeSingle()

    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('review_moderation')
      .select('id')
      .eq('booking_code', booking_code)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Review untuk booking ini sudah disubmit sebelumnya' }, { status: 409 })
    }

    const { error: insertErr } = await supabase.from('review_moderation').insert({
      booking_code,
      rating,
      review: review_text.trim(),
      name: reviewer_name || booking.name || 'Anonymous',
      package: booking.package_title || '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    })

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[review/submit POST]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET: check if booking has already been reviewed & get booking info
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const code = new URL(req.url).searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code wajib' }, { status: 400 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('code, package_title, name, date, status')
    .eq('code', code)
    .maybeSingle()

  if (!booking) return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })

  const { data: existingReview } = await supabase
    .from('review_moderation')
    .select('id')
    .eq('booking_code', code)
    .maybeSingle()

  return NextResponse.json({
    booking: {
      code: booking.code,
      packageTitle: booking.package_title,
      name: booking.name,
      date: booking.date,
      status: booking.status,
    },
    alreadyReviewed: !!existingReview,
  })
}
