import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { code } = await req.json()
    if (!code) return NextResponse.json({ ok: false })

    const { error } = await supabase.rpc('increment_voucher_use', { voucher_code: code })
    if (error) {
      // Fallback: manual increment
      const { data: v } = await supabase.from('vouchers').select('used_count').ilike('code', code).maybeSingle()
      if (v) {
        await supabase.from('vouchers').update({ used_count: (v.used_count || 0) + 1 }).ilike('code', code)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[voucher/use POST]', e)
    return NextResponse.json({ ok: false })
  }
}
