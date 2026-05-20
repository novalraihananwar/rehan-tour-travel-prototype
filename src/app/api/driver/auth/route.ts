import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Fallback accounts — active until Supabase schema is run
const FALLBACK_ACCOUNTS: Record<string, { pin: string; name: string; vehicle: string }> = {
  'budi.santoso': { pin: 'RTT2026', name: 'Budi Santoso',  vehicle: 'RTT-001' },
  'andi.wijaya':  { pin: 'RTT2026', name: 'Andi Wijaya',   vehicle: 'RTT-002' },
  'rudi.hartono': { pin: 'RTT2026', name: 'Rudi Hartono',  vehicle: 'RTT-003' },
  'demo':         { pin: '1234',    name: 'Driver Demo',   vehicle: 'RTT-DEMO' },
}

export async function POST(req: NextRequest) {
  try {
    const { username, pin } = await req.json()

    if (!username || !pin) {
      return NextResponse.json({ error: 'Username dan PIN diperlukan.' }, { status: 400 })
    }

    const uname = username.toLowerCase().trim()

    // Try Supabase first
    try {
      const admin = getSupabaseAdmin()
      const { data: driver, error } = await admin
        .from('drivers')
        .select('id, username, name, vehicle_id, pin_hash, is_active')
        .eq('username', uname)
        .eq('is_active', true)
        .single()

      if (!error && driver) {
        if (driver.pin_hash !== pin) {
          return NextResponse.json({ error: 'Username atau PIN salah.' }, { status: 401 })
        }
        return NextResponse.json({
          ok: true,
          driver: { id: driver.id, username: driver.username, name: driver.name, vehicle: driver.vehicle_id },
        })
      }
    } catch {
      // Supabase unavailable or table not yet created — fall through to fallback
    }

    // Fallback to hardcoded accounts
    const account = FALLBACK_ACCOUNTS[uname]
    if (!account || account.pin !== pin) {
      return NextResponse.json({ error: 'Username atau PIN salah.' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      driver: { id: null, username: uname, name: account.name, vehicle: account.vehicle },
    })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
