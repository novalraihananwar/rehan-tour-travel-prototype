import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { username, pin } = await req.json()

    if (!username || !pin) {
      return NextResponse.json({ error: 'Username dan PIN diperlukan.' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { data: driver, error } = await admin
      .from('drivers')
      .select('id, username, name, vehicle_id, pin_hash, is_active')
      .eq('username', username.toLowerCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !driver) {
      return NextResponse.json({ error: 'Username atau PIN salah.' }, { status: 401 })
    }

    // Simple PIN check — upgrade to bcrypt.compare() before production
    if (driver.pin_hash !== pin) {
      return NextResponse.json({ error: 'Username atau PIN salah.' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      driver: {
        id: driver.id,
        username: driver.username,
        name: driver.name,
        vehicle: driver.vehicle_id,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
