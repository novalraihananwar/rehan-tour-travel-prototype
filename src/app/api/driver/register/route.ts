import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, ktpNumber, simNumber, simExpiry, username, pin } = await req.json()

    if (!name || !phone || !email || !ktpNumber || !simNumber || !simExpiry || !username || !pin) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
    }
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN harus 6 digit angka.' }, { status: 400 })
    }
    if (!/^[a-z][a-z0-9._]{2,29}$/.test(username)) {
      return NextResponse.json({ error: 'Format username tidak valid.' }, { status: 400 })
    }
    if (!/^0[0-9]{9,12}$/.test(phone)) {
      return NextResponse.json({ error: 'Format nomor HP tidak valid.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 })
    }
    if (!/^\d{16}$/.test(ktpNumber)) {
      return NextResponse.json({ error: 'Nomor KTP harus 16 digit angka.' }, { status: 400 })
    }
    if (simNumber.length < 12) {
      return NextResponse.json({ error: 'Nomor SIM minimal 12 karakter.' }, { status: 400 })
    }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (new Date(simExpiry) <= today) {
      return NextResponse.json({ error: 'Masa berlaku SIM sudah kadaluarsa.' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { data: existing } = await admin
      .from('drivers')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan. Coba username lain.' }, { status: 409 })
    }

    const { error: insertError } = await admin.from('drivers').insert({
      name,
      phone,
      email,
      ktp_number:  ktpNumber,
      sim_number:  simNumber,
      sim_expiry:  simExpiry,
      username,
      pin_hash:    pin,
      vehicle_id:  null,
      is_active:   false,
      status:      'pending',
    })

    if (insertError) {
      console.error('[driver/register] insert error:', insertError)
      if (insertError.code === '42703') {
        return NextResponse.json({ error: 'Schema Supabase perlu diupdate. Jalankan SQL migration.' }, { status: 500 })
      }
      return NextResponse.json({ error: 'Gagal menyimpan data. Coba lagi.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[driver/register]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
