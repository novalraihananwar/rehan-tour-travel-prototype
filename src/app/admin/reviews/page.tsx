'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star, Check, X, Flag, MessageSquare, ThumbsUp } from 'lucide-react'
import { testimonials } from '@/lib/data'

const pendingReviews = [
  {
    id: 'r-new-1',
    name: 'Carlos Mendez',
    country: '🇪🇸',
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
    avatar: 'https://ui-avatars.com/api/?name=HY&background=2A2520&color=E8703A&bold=true&size=80&format=png',
    rating: 5,
    review: 'Best travel decision I made in Indonesia. The overland route from Surabaya to Bali is spectacular — I\'d been just doing Bali flights for years and missing so much.',
    package: 'East Java to Bali Overland',
    date: '2026-05-11',
    status: 'pending',
  },
]

const allReviews = [
  ...testimonials.map((t) => ({ ...t, status: 'approved' as const })),
  ...pendingReviews,
]

const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
  rating: r,
  count: allReviews.filter((rv) => rv.rating === r && rv.status === 'approved').length,
}))

const totalApproved = allReviews.filter((r) => r.status === 'approved').length
const avgRating = (allReviews.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.rating, 0) / totalApproved).toFixed(1)

export default function ReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({})

  const displayed = allReviews.filter((r) => {
    const status = localStatus[r.id] || r.status
    if (filter === 'pending') return status === 'pending'
    if (filter === 'approved') return status === 'approved'
    return true
  })

  const approve = (id: string) => setLocalStatus((p) => ({ ...p, [id]: 'approved' }))
  const reject = (id: string) => setLocalStatus((p) => ({ ...p, [id]: 'rejected' }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-cream">Reviews</h1>
        <p className="text-sm text-cream-muted mt-0.5">{allReviews.length} total · {allReviews.filter(r => r.status === 'pending').length} awaiting approval</p>
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
            { label: 'Pending Approval', value: pendingReviews.length, color: 'text-gold' },
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
            {f === 'pending' && pendingReviews.length > 0 && (
              <span className="ml-1.5 bg-sunset/20 text-sunset px-1.5 py-0.5 rounded-full">{pendingReviews.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {displayed.map((review, i) => {
          const currentStatus = localStatus[review.id] || review.status
          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card rounded-2xl p-5 ${currentStatus === 'pending' ? 'border-gold/20' : currentStatus === 'rejected' ? 'opacity-40' : ''}`}
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-cream text-sm">{review.name}</span>
                        <span className="text-sm">{review.country}</span>
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

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {currentStatus === 'pending' && (
                      <>
                        <button onClick={() => approve(review.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-jungle-light bg-jungle/10 border border-jungle/25 hover:bg-jungle/20 transition-colors">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => reject(review.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-lava bg-lava/10 border border-lava/25 hover:bg-lava/20 transition-colors">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-cream-muted hover:text-cream border border-white/8 hover:border-white/15 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-cream-muted hover:text-cream border border-white/8 hover:border-white/15 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" /> Feature
                    </button>
                    <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-cream-muted hover:text-lava border border-white/8 hover:border-lava/25 transition-colors">
                      <Flag className="w-3.5 h-3.5" /> Flag
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
