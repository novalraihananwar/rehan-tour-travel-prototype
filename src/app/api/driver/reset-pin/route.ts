/*
 * Jalankan di Supabase SQL Editor sebelum menggunakan fitur ini:
 *
 * CREATE TABLE IF NOT EXISTS driver_pin_resets (
 *   id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   driver_id  uuid REFERENCES drivers(id) ON DELETE CASCADE,
 *   token      text NOT NULL UNIQUE,
 *   expires_at timestamptz NOT NULL,
 *   used_at    timestamptz,
 *   created_at timestamptz DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS driver_pin_resets_token_idx ON driver_pin_resets(token);
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const PIN_REGEX = /^\d{6}$/

interface ResetRow {
  id: string
  driver_id: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { token?: unknown; newPin?: unknown }
    const token  = typeof body.token  === 'string' ? body.token.trim()  : ''
    const newPin = typeof body.newPin === 'string' ? body.newPin.trim() : ''

    if (!token) {
      return NextResponse.json({ error: 'Token tidak valid.' }, { status: 400 })
    }

    if (!PIN_REGEX.test(newPin)) {
      return NextResponse.json({ error: 'PIN harus 6 digit angka.' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Find a valid, unused, non-expired token
    const { data: row, error: findError } = await admin
      .from('driver_pin_resets')
      .select('id, driver_id')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single<ResetRow>()

    if (findError || !row) {
      return NextResponse.json(
        { error: 'Link sudah expired atau tidak valid. Minta link baru.' },
        { status: 400 },
      )
    }

    // Update driver pin
    const { error: updateDriverError } = await admin
      .from('drivers')
      .update({ pin_hash: newPin })
      .eq('id', row.driver_id)

    if (updateDriverError) {
      console.error('[reset-pin] Update driver error:', updateDriverError)
      return NextResponse.json({ error: 'Server error.' }, { status: 500 })
    }

    // Mark token as used
    const { error: markUsedError } = await admin
      .from('driver_pin_resets')
      .update({ used_at: new Date().toISOString() })
      .eq('id', row.id)

    if (markUsedError) {
      // Non-fatal — PIN was already updated; log and continue
      console.error('[reset-pin] Mark used error:', markUsedError)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[reset-pin] Unexpected error:', e)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
