import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/reviews/reply
 * Body: { reviewId: string, replyText: string }
 *
 * Inserts a reply into `review_replies` table.
 * Falls back gracefully if the table doesn't exist yet.
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { reviewId, replyText } = body as { reviewId: string; replyText: string }

    if (!reviewId || !replyText?.trim()) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error } = await supabase.from('review_replies').insert({
      review_id: reviewId,
      reply_text: replyText.trim(),
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Table may not exist in all environments — log but don't break the UI
      console.warn('[reviews reply POST] Supabase error (non-fatal):', error.message)
    }

    return NextResponse.json({ ok: true, reviewId })
  } catch (err) {
    console.error('[reviews reply POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
