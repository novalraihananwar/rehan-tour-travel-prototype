import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, name, type, plate, capacity, status, notes, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ vehicles: data || [] })
  } catch (e) {
    console.error('vehicles GET error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { name, type, plate, capacity, notes } = body as {
      name: string; type: string; plate: string; capacity: number; notes?: string
    }

    if (!name || !type || !plate) {
      return NextResponse.json({ error: 'name, type, dan plate wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({ name, type, plate, capacity: capacity || 4, notes: notes || null, status: 'available' })
      .select('id, name, type, plate, capacity, status, notes, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ vehicle: data })
  } catch (e) {
    console.error('vehicles POST error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { id, status } = body as { id: string; status: 'available' | 'maintenance' }

    if (!id || !status) {
      return NextResponse.json({ error: 'id dan status wajib diisi' }, { status: 400 })
    }

    const { error } = await supabase.from('vehicles').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('vehicles PATCH error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { id } = body as { id: string }

    if (!id) {
      return NextResponse.json({ error: 'id wajib diisi' }, { status: 400 })
    }

    const { data: vehicle, error: fetchErr } = await supabase
      .from('vehicles')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchErr || !vehicle) {
      return NextResponse.json({ error: 'Kendaraan tidak ditemukan' }, { status: 404 })
    }
    if (vehicle.status !== 'available') {
      return NextResponse.json({ error: 'Kendaraan sedang digunakan.' }, { status: 400 })
    }

    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('vehicles DELETE error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
