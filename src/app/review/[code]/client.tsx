'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Star, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

interface BookingInfo {
  code: string
  packageTitle: string
  name: string
  date: string
  status: string
}

export function ReviewClient({ code }: { code: string }) {
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch(`/api/review/submit?code=${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setBooking(data.booking)
        setAlreadyReviewed(data.alreadyReviewed)
      })
      .catch(() => setError('Gagal memuat data booking'))
      .finally(() => setLoading(false))
  }, [code])

  const handleSubmit = async () => {
    if (rating === 0) { setSubmitError('Pilih rating bintang terlebih dahulu'); return }
    if (reviewText.trim().length < 20) { setSubmitError('Review minimal 20 karakter'); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_code: code,
          rating,
          review_text: reviewText.trim(),
          reviewer_name: booking?.name || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || 'Gagal submit review'); return }
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const starLabels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent']

  if (loading) {
    return (
      <div className="min-h-screen bg-volcanic flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-sunset border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-volcanic flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <Link href={`/booking/${code}`} className="inline-flex items-center gap-2 text-sm text-cream-muted hover:text-cream mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to booking
        </Link>

        {/* Error state */}
        {error && !booking && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-lava mx-auto mb-4" />
            <h1 className="font-display text-2xl text-cream mb-2">Review Not Available</h1>
            <p className="text-cream-muted text-sm mb-6">{error}</p>
            <Link href="/" className="btn-primary px-6 py-2.5 text-sm inline-flex">Back to Home</Link>
          </motion.div>
        )}

        {/* Already reviewed */}
        {booking && alreadyReviewed && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-jungle-light mx-auto mb-4" />
            <h1 className="font-display text-2xl text-cream mb-2">Review Submitted</h1>
            <p className="text-cream-muted text-sm mb-2">Terima kasih sudah meninggalkan review untuk</p>
            <p className="text-sunset font-medium mb-6">{booking.packageTitle}</p>
            <p className="text-xs text-cream-muted mb-8">Review kamu akan muncul setelah melalui moderasi.</p>
            <Link href="/packages" className="btn-primary px-6 py-2.5 text-sm inline-flex">Explore Packages</Link>
          </motion.div>
        )}

        {/* Success state */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-jungle/20 border-2 border-jungle flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-jungle-light" />
              </div>
              <h1 className="font-display text-2xl text-cream mb-2">Thank You!</h1>
              <p className="text-cream-muted text-sm mb-1">Your review has been submitted successfully.</p>
              <p className="text-xs text-cream-muted mb-8">It will appear on our website after moderation (usually within 24 hours).</p>
              <div className="flex justify-center gap-3">
                <Link href="/packages" className="btn-primary px-5 py-2.5 text-sm inline-flex">Book Again</Link>
                <Link href="/" className="btn-ghost px-5 py-2.5 text-sm inline-flex">Home</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review form */}
        {booking && !alreadyReviewed && !submitted && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-xs text-sunset tracking-widest uppercase mb-1">Share Your Experience</p>
              <h1 className="font-display text-2xl text-cream mb-1">How was your trip?</h1>
              <p className="text-cream-muted text-sm">{booking.packageTitle}</p>
              {booking.date && (
                <p className="text-xs text-cream-muted mt-0.5">
                  {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Star rating */}
            <div className="mb-6">
              <p className="text-xs text-cream-muted uppercase tracking-wider mb-3 text-center">Your Rating</p>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-gold text-gold'
                          : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {(hoverRating || rating) > 0 && (
                <p className="text-center text-xs text-gold font-medium">{starLabels[hoverRating || rating]}</p>
              )}
            </div>

            {/* Review text */}
            <div className="mb-6">
              <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">Your Review</label>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Tell us about your experience — the highlights, the guide, the views, what surprised you most..."
                rows={5}
                className="input-dark w-full text-sm resize-none"
              />
              <p className={`text-xs mt-1 ${reviewText.length < 20 ? 'text-cream-muted' : 'text-jungle-light'}`}>
                {reviewText.length}/20 minimum characters
              </p>
            </div>

            {submitError && (
              <p className="text-sm text-lava mb-4">{submitError}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="btn-primary w-full py-3 text-sm disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>

            <p className="text-xs text-cream-muted text-center mt-4">
              Reviews are public after moderation · No personal info shared
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
