import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ settings: data })
  } catch (e) {
    console.error('[settings GET]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { error } = await supabase.from('site_settings').upsert({
      id: 1,
      updated_at: new Date().toISOString(),
      ...body,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[settings POST]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
