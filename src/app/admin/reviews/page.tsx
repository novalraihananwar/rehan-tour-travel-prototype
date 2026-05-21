'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Star, Check, X, Flag, MessageSquare, ThumbsUp } from 'lucide-react'
import { testimonials } from '@/lib/data'

// ─── Static seed data (pending reviews) ───────────────────────────────────────

const pendingReviews = [
  {
    id: 'r-new-1',
    name: 'Carlos Mendez',
    country: '🇪🇸',
    flag: '🇪🇸',
    avatar: 'https://ui-avatars.com/api/?name=TV&background=252020&color=D4A843&bold=true&size=80&format=png',
    rating: 5,
    review: 'Incredible experience! The Bromo sunrise was everything I hoped for and more. Our guide Rizal was exceptional — very knowledgeable and funny.',
    package: 'Bromo Sunrise Classic',
    date: '2026-05-13',
    status: 'pending',
  },
  {
    id: 'r-new-2',
    name: 'Mei Lin',
    country: '🇨🇳',
    flag: '🇨🇳',
    avatar: 'https://ui-avatars.com/api/?name=SR&background=2D2020&color=F08457&bold=true&size=80&format=png',
    rating: 4,
    review: '很棒的体验！布罗莫火山的日出真的太美了。我们的导游英语说得很好，时间安排非常准时。唯一的小遗憾是吉普车有点旧。',
    package: 'Bromo + Ijen Expedition',
    date: '2026-05-12',
    status: 'pending',
  },
  {
    id: 'r-new-3',
    name: 'Henrik Larsen',
    country: '🇩🇰',
    flag: '🇩🇰',
    avatar: 'https://ui-avatars.com/api/?name=HY&background=2A2520&color=E8703A&bold=true&size=80&format=png',
    rating: 5,
    review: 'Best travel decision I made in Indonesia. The overland route from Surabaya to Bali is spectacular — I\'d been just doing Bali flights for years and missing so much.',
    package: 'East Java to Bali Overland',
    date: '2026-05-11',
    status: 'pending',
  },
]

// Base list — merged once at module level (immutable seed, statuses are tracked via localStatus)
const allReviews = [
  ...testimonials.map((t) => ({ ...t, status: 'approved' as const })),
  ...pendingReviews,
]

// ─── Reply Modal ───────────────────────────────────────────────────────────────

interface ReplyModalProps {
  reviewId: string
  reviewerName: string
  onClose: () => void
  onSubmit: (reviewId: string, text: string) => Promise<void>
}

function ReplyModal({ reviewId, reviewerName, onClose, onSubmit }: ReplyModalProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Auto-focus textarea on open
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    await onSubmit(reviewId, text)
    setLoading(false)
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md bg-volcanic-800 border border-white/10 rounded-2xl p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-cream text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-ocean-light" />
            Reply to {reviewerName}
          </h3>
          <button
            onClick={onClose}
            className="text-cream-muted hover:text-cream transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-cream placeholder-cream-muted/50 resize-none focus:outline-none focus:border-ocean-light/40 transition-colors"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-cream-muted border border-white/10 hover:border-white/20 hover:text-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-ocean-light bg-ocean/10 border border-ocean/25 hover:bg-ocean/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Reply state
  const [replyModal, setReplyModal] = useState<{ reviewId: string; reviewerName: string } | null>(null)
  const [replies, setReplies] = useState<Record<string, string>>({})

  // Feature state
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set())

  // Flag state
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set())

  // BUG-5 FIX: reactive derived values — recompute whenever localStatus changes
  const { ratingDistribution, totalApproved, avgRating } = useMemo(() => {
    const approved = allReviews.filter(
      (r) => (localStatus[r.id] ?? r.status) === 'approved'
    )
    const total = approved.length

    // BUG-1 FIX: guard against division-by-zero
    const avg =
      total > 0
        ? (approved.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : '0.0'

    const dist = [5, 4, 3, 2, 1].map((r) => ({
      rating: r,
      count: approved.filter((rv) => rv.rating === r).length,
    }))

    return { ratingDistribution: dist, totalApproved: total, avgRating: avg }
  }, [localStatus])

  // BUG-4 FIX: pending count derived from actual localStatus, not static array length
  const pendingCount = useMemo(
    () =>
      allReviews.filter(
        (r) => (localStatus[r.id] ?? r.status) === 'pending'
      ).length,
    [localStatus]
  )

  const displayed = allReviews.filter((r) => {
    const status = localStatus[r.id] ?? r.status
    if (filter === 'pending') return status === 'pending'
    if (filter === 'approved') return status === 'approved'
    return true
  })

  // BUG-2 FIX: persist status to backend via PATCH /api/admin/reviews
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    // Optimistic update
    setLocalStatus((p) => ({ ...p, [id]: status }))
    setActionLoading(id)
    try {
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    } catch (err) {
      console.error('[reviews] Failed to persist status:', err)
      // Keep optimistic state — UI stays correct even if backend is unreachable
    } finally {
      setActionLoading(null)
    }
  }

  const approve = (id: string) => updateStatus(id, 'approved')
  const reject = (id: string) => updateStatus(id, 'rejected')

  // ── REPLY ──────────────────────────────────────────────────────────────────
  const handleReply = (reviewId: string, reviewerName: string) => {
    setReplyModal({ reviewId, reviewerName })
  }

  const submitReply = async (reviewId: string, replyText: string) => {
    // Optimistic: store reply locally right away
    setReplies((prev) => ({ ...prev, [reviewId]: replyText }))
    try {
      await fetch('/api/admin/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, replyText }),
      })
    } catch (err) {
      console.error('[reviews] Failed to persist reply:', err)
    }
  }

  // ── FEATURE ────────────────────────────────────────────────────────────────
  const handleFeature = async (id: string) => {
    const isFeatured = featuredIds.has(id)
    const next = new Set(featuredIds)
    isFeatured ? next.delete(id) : next.add(id)
    setFeaturedIds(next)

    try {
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !isFeatured }),
      })
    } catch (err) {
      console.error('[reviews] Failed to persist featured:', err)
    }
  }

  // ── FLAG ───────────────────────────────────────────────────────────────────
  const handleFlag = async (id: string) => {
    const isFlagged = flaggedIds.has(id)
    const next = new Set(flaggedIds)
    isFlagged ? next.delete(id) : next.add(id)
    setFlaggedIds(next)

    try {
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, flagged: !isFlagged }),
      })
    } catch (err) {
      console.error('[reviews] Failed to persist flagged:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Reply Modal */}
      <AnimatePresence>
        {replyModal && (
          <ReplyModal
            key="reply-modal"
            reviewId={replyModal.reviewId}
            reviewerName={replyModal.reviewerName}
            onClose={() => setReplyModal(null)}
            onSubmit={submitReply}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-cream">Reviews</h1>
        <p className="text-sm text-cream-muted mt-0.5">
          {allReviews.length} total · {pendingCount} awaiting approval
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall score */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="font-display text-6xl font-bold text-gradient-sunset">{avgRating}</div>
          <div className="flex items-center gap-1 my-2">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(avgRating)) ? 'text-gold fill-gold' : 'text-volcanic-500'}`} />
            ))}
          </div>
          <p className="text-sm text-cream-muted">Based on {totalApproved} verified reviews</p>
        </div>

        {/* Rating distribution */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-medium text-cream mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3 text-xs">
                <span className="text-cream-muted w-8">{rating} ★</span>
                <div className="flex-1 h-1.5 bg-volcanic-500 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-sunset"
                    style={{ width: `${totalApproved ? (count / totalApproved) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-cream-muted w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-cream">Review Stats</h3>
          {[
            { label: 'Pending Approval', value: pendingCount, color: 'text-gold' },
            { label: 'Published Reviews', value: totalApproved, color: 'text-jungle-light' },
            { label: 'Avg Response Time', value: '< 4 hours', color: 'text-ocean-light' },
            { label: 'Response Rate', value: '98%', color: 'text-sunset' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between text-sm">
              <span className="text-cream-muted">{s.label}</span>
              <span className={`font-medium ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all border ${filter === f ? 'bg-sunset/20 text-sunset border-sunset/30' : 'text-cream-muted border-white/10 hover:border-sunset/20'}`}
          >
            {f}
            {/* BUG-4 FIX: badge uses reactive pendingCount */}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-sunset/20 text-sunset px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {displayed.map((review, i) => {
          const currentStatus = localStatus[review.id] ?? review.status
          const isLoading = actionLoading === review.id
          const isFeatured = featuredIds.has(review.id)
          const isFlagged = flaggedIds.has(review.id)
          const existingReply = replies[review.id]

          // BUG-6 FIX: prefer flag (emoji) over country (text name) — testimonials have both
          const displayFlag = ('flag' in review && review.flag) ? review.flag : review.country

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={[
                'glass-card rounded-2xl p-5 transition-colors',
                currentStatus === 'pending' ? 'border-gold/20' : '',
                currentStatus === 'rejected' ? 'opacity-40' : '',
                isFeatured ? 'ring-1 ring-gold/30 bg-gold/5' : '',
                isFlagged ? 'ring-1 ring-lava/30' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="flex items-start gap-4">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  width={44}
                  height={44}
                  className="rounded-xl object-cover w-11 h-11 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-cream text-sm">{review.name}</span>
                        {/* BUG-6 FIX: always render an emoji flag */}
                        <span className="text-sm">{displayFlag}</span>
                        {Boolean('verified' in review && (review as any).verified) && (
                          <span className="text-xs text-jungle-light flex items-center gap-0.5 bg-jungle/10 px-2 py-0.5 rounded-full border border-jungle/20">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                        {currentStatus === 'pending' && (
                          <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                            Pending
                          </span>
                        )}
                        {isFeatured && (
                          <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/25 flex items-center gap-0.5">
                            <ThumbsUp className="w-3 h-3" /> Featured
                          </span>
                        )}
                        {isFlagged && (
                          <span className="text-xs text-lava bg-lava/10 px-2 py-0.5 rounded-full border border-lava/25 flex items-center gap-0.5">
                            <Flag className="w-3 h-3" /> Flagged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-cream-muted">
                        <span>{review.package}</span>
                        <span>·</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-gold fill-gold' : 'text-volcanic-500'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-cream-muted leading-relaxed">{review.review}</p>

                  {/* Existing reply */}
                  {existingReply && (
                    <div className="mt-3 pl-3 border-l-2 border-ocean/30">
                      <p className="text-xs text-cream-muted mb-0.5 font-medium">Your reply</p>
                      <p className="text-xs text-cream/80 leading-relaxed">{existingReply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {currentStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => approve(review.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-jungle-light bg-jungle/10 border border-jungle/25 hover:bg-jungle/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => reject(review.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-lava bg-lava/10 border border-lava/25 hover:bg-lava/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {/* Reply */}
                    <button
                      onClick={() => handleReply(review.id, review.name)}
                      className={[
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors border',
                        existingReply
                          ? 'text-ocean-light bg-ocean/10 border-ocean/25 hover:bg-ocean/20'
                          : 'text-cream-muted hover:text-cream border-white/8 hover:border-white/15',
                      ].join(' ')}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {existingReply ? 'Edit Reply' : 'Reply'}
                    </button>

                    {/* Feature */}
                    <button
                      onClick={() => handleFeature(review.id)}
                      className={[
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors border',
                        isFeatured
                          ? 'text-gold bg-gold/10 border-gold/30 hover:bg-gold/20'
                          : 'text-cream-muted hover:text-gold border-white/8 hover:border-gold/20',
                      ].join(' ')}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {isFeatured ? 'Featured' : 'Feature'}
                    </button>

                    {/* Flag */}
                    <button
                      onClick={() => handleFlag(review.id)}
                      className={[
                        'ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors border',
                        isFlagged
                          ? 'text-lava bg-lava/10 border-lava/30 hover:bg-lava/20'
                          : 'text-cream-muted hover:text-lava border-white/8 hover:border-lava/25',
                      ].join(' ')}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {isFlagged ? 'Unflag' : 'Flag'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
