import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// DDL untuk tabel vouchers (jalankan di Supabase SQL editor):
// CREATE TABLE IF NOT EXISTS vouchers (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   code text UNIQUE NOT NULL,
//   discount_percent integer DEFAULT 0,
//   discount_flat_usd numeric DEFAULT 0,
//   valid_until timestamptz,
//   max_uses integer DEFAULT 100,
//   used_count integer DEFAULT 0,
//   is_active boolean DEFAULT true,
//   description text,
//   created_at timestamptz DEFAULT now()
// );

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { code, total_usd } = await req.json()
    if (!code) return NextResponse.json({ valid: false, error: 'Kode voucher kosong' })

    const { data: voucher, error } = await supabase
      .from('vouchers')
      .select('*')
      .ilike('code', code.trim())
      .maybeSingle()

    if (error || !voucher) {
      return NextResponse.json({ valid: false, error: 'Kode voucher tidak valid' })
    }

    if (!voucher.is_active) {
      return NextResponse.json({ valid: false, error: 'Voucher sudah tidak aktif' })
    }

    if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Voucher sudah kadaluarsa' })
    }

    if (voucher.max_uses > 0 && voucher.used_count >= voucher.max_uses) {
      return NextResponse.json({ valid: false, error: 'Voucher sudah mencapai batas penggunaan' })
    }

    const totalUsd = parseFloat(total_usd) || 0
    let discountUsd = 0

    if (voucher.discount_percent > 0) {
      discountUsd = totalUsd * (voucher.discount_percent / 100)
    } else if (voucher.discount_flat_usd > 0) {
      discountUsd = Math.min(parseFloat(voucher.discount_flat_usd), totalUsd)
    }

    discountUsd = Math.round(discountUsd * 100) / 100
    const finalUsd = Math.max(0, totalUsd - discountUsd)

    return NextResponse.json({
      valid: true,
      code: voucher.code,
      discount_usd: discountUsd,
      final_usd: finalUsd,
      description: voucher.description || (
        voucher.discount_percent > 0
          ? `${voucher.discount_percent}% discount`
          : `$${voucher.discount_flat_usd} off`
      ),
    })
  } catch (e) {
    console.error('[voucher POST]', e)
    return NextResponse.json({ valid: false, error: 'Server error' })
  }
}
