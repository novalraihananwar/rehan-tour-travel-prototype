import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('id, username, name, phone, vehicle_type, vehicle_plate, created_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ drivers: data || [] })
  } catch (e) {
    console.error('driver-approval GET error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { driverId, action, vehicleId } = body as {
      driverId: string
      action: 'approve' | 'reject'
      vehicleId?: string
    }

    if (!driverId || !action) {
      return NextResponse.json({ error: 'Missing driverId or action' }, { status: 400 })
    }
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
    }

    if (action === 'approve') {
      const update: Record<string, unknown> = { is_active: true, status: 'approved' }
      if (vehicleId) update.vehicle_id = vehicleId
      const { error } = await supabase.from('drivers').update(update).eq('id', driverId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from('drivers')
        .update({ status: 'rejected' })
        .eq('id', driverId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('driver-approval PATCH error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
