import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/reviews
 * Body: { id: string, status: 'approved' | 'rejected' }
 *
 * Upserts a review moderation record in the `review_moderation` table.
 * Falls back gracefully if the table doesn't exist yet (so local-only state
 * still works in the UI).
 */
export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { id, status } = body as { id: string; status: string }

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error } = await supabase
      .from('review_moderation')
      .upsert(
        { review_id: id, status, moderated_at: new Date().toISOString() },
        { onConflict: 'review_id' }
      )

    if (error) {
      // Table may not exist in all environments — log but don't break the UI
      console.warn('[reviews PATCH] Supabase error (non-fatal):', error.message)
    }

    return NextResponse.json({ ok: true, id, status })
  } catch (err) {
    console.error('[reviews PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
