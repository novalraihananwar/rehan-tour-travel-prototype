'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock, Users, Star, Edit3, Eye, Plus, ToggleLeft, ToggleRight,
  X, Check, AlertCircle, Save, ExternalLink,
} from 'lucide-react'

interface Package {
  id: string
  slug: string
  title: string
  subtitle: string
  cover_image?: string
  coverImage?: string
  type: string
  duration: string
  duration_days?: number
  durationDays?: number
  price_usd?: number
  price_idr?: number
  price?: { usd: number; idr: number }
  max_group_size?: number
  maxGroupSize?: number
  available_seats?: number
  availableSeats?: number
  rating: number
  review_count?: number
  reviewCount?: number
  route_description?: string
  routeDescription?: string
  is_active: boolean
  source?: string
  tags?: string[] | string
  highlights?: string[] | string
  included?: string[] | string
  excluded?: string[] | string
}

function parseArr(v: unknown): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v
  try { return JSON.parse(v as string) } catch { return [] }
}

function pkgPrice(p: Package) {
  if (p.price_usd) return p.price_usd
  if (p.price?.usd) return p.price.usd
  return 0
}
function pkgSeats(p: Package) { return p.available_seats ?? p.availableSeats ?? 0 }
function pkgGroup(p: Package) { return p.max_group_size ?? p.maxGroupSize ?? 13 }
function pkgImage(p: Package) { return p.cover_image || p.coverImage || '' }
function pkgReviews(p: Package) { return p.review_count ?? p.reviewCount ?? 0 }

const TYPE_COLORS: Record<string, string> = {
  shared:    'bg-jungle/15 text-jungle-light border-jungle/25',
  private:   'bg-sunset/15 text-sunset border-sunset/25',
  luxury:    'bg-gold/15 text-gold border-gold/25',
  honeymoon: 'bg-pink-900/20 text-pink-300 border-pink-500/25',
}

export default function AdminPackagesPage() {
  const [packages, setPackages]     = useState<Package[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('All')
  const [editPkg, setEditPkg]       = useState<Package | null>(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/packages?admin=1')
      const data = await res.json()
      setPackages(data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchPackages() }, [])

  const handleToggleActive = async (pkg: Package) => {
    const newVal = !pkg.is_active
    setPackages(prev => prev.map(p => p.slug === pkg.slug ? { ...p, is_active: newVal } : p))
    await fetch('/api/packages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: pkg.slug, isActive: newVal }),
    })
  }

  const handleSaveEdit = async () => {
    if (!editPkg) return
    setSaving(true)
    try {
      await fetch('/api/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug:            editPkg.slug,
          title:           editPkg.title,
          subtitle:        editPkg.subtitle,
          priceUsd:        pkgPrice(editPkg),
          type:            editPkg.type,
          duration:        editPkg.duration,
          availableSeats:  pkgSeats(editPkg),
          routeDescription: editPkg.route_description || editPkg.routeDescription || '',
          highlights:      parseArr(editPkg.highlights),
          included:        parseArr(editPkg.included),
          excluded:        parseArr(editPkg.excluded),
          tags:            parseArr(editPkg.tags),
          coverImage:      pkgImage(editPkg),
          isActive:        editPkg.is_active,
        }),
      })
      await fetchPackages()
      setSaveMsg('Tersimpan!')
      setTimeout(() => { setSaveMsg(''); setEditPkg(null) }, 1500)
    } catch { setSaveMsg('Gagal menyimpan.') } finally { setSaving(false) }
  }

  const types = ['All', 'Shared', 'Private', 'Luxury', 'Honeymoon']
  const filtered = packages.filter(p => filter === 'All' || p.type.toLowerCase() === filter.toLowerCase())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Tour Packages</h1>
          <p className="text-sm text-cream-muted mt-0.5">
            {packages.length} paket · {packages.filter(p => p.is_active).length} aktif · {packages.filter(p => !p.is_active).length} nonaktif
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Paket
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              filter === t
                ? 'bg-gradient-to-r from-sunset to-gold text-volcanic border-transparent'
                : 'border-white/10 text-cream-muted hover:text-cream hover:border-white/25'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Package grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pkg, i) => (
            <motion.div
              key={pkg.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card rounded-2xl overflow-hidden transition-all ${!pkg.is_active ? 'opacity-50 grayscale' : ''}`}
            >
              {/* Cover image */}
              <div className="relative h-44 overflow-hidden bg-volcanic-400">
                {pkgImage(pkg) && (
                  <Image src={pkgImage(pkg)} alt={pkg.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic-300 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${TYPE_COLORS[pkg.type] || ''}`}>
                    {pkg.type}
                  </span>
                  {pkg.source === 'supabase' && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-900/20 text-blue-300 backdrop-blur-sm">
                      DB
                    </span>
                  )}
                </div>

                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(pkg)}
                  className="absolute top-3 right-3 p-1.5 glass rounded-lg"
                  title={pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {pkg.is_active
                    ? <ToggleRight className="w-5 h-5 text-jungle-light" />
                    : <ToggleLeft className="w-5 h-5 text-cream-muted" />
                  }
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-volcanic/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    <span className="text-xs text-cream">{pkg.rating} ({pkgReviews(pkg)})</span>
                  </div>
                  {!pkg.is_active && (
                    <span className="text-xs bg-volcanic/80 text-cream-muted px-2 py-0.5 rounded-full">Nonaktif</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-display text-base text-cream mb-0.5 line-clamp-1">{pkg.title}</h3>
                <p className="text-xs text-cream-muted mb-3 line-clamp-1">{pkg.subtitle}</p>

                <div className="flex items-center gap-3 text-xs text-cream-muted mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pkg.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max {pkgGroup(pkg)}</span>
                  <span className={pkgSeats(pkg) <= 3 ? 'text-lava' : 'text-jungle-light'}>
                    {pkgSeats(pkg)} kursi
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="font-display text-xl font-bold text-gradient-sunset">
                    ${pkgPrice(pkg)}
                    <span className="text-xs text-cream-muted font-sans font-normal ml-1">/person</span>
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/packages/${pkg.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-white/5 text-cream-muted hover:text-cream transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setEditPkg(pkg)}
                      className="p-1.5 rounded-lg hover:bg-sunset/10 text-cream-muted hover:text-sunset transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit drawer */}
      <AnimatePresence>
        {editPkg && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setEditPkg(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-volcanic-200 border-l border-white/8 overflow-y-auto"
            >
              <div className="sticky top-0 glass border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="font-display text-lg text-cream">Edit Paket</h2>
                <div className="flex items-center gap-2">
                  {saveMsg && (
                    <span className={`text-xs ${saveMsg.includes('Gagal') ? 'text-red-300' : 'text-jungle-light'}`}>
                      {saveMsg}
                    </span>
                  )}
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button onClick={() => setEditPkg(null)} className="p-2 rounded-lg hover:bg-white/5 text-cream-muted hover:text-cream transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Status toggle */}
                <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-cream">Status Paket</p>
                    <p className="text-xs text-cream-muted mt-0.5">
                      {editPkg.is_active ? 'Aktif — terlihat di website' : 'Nonaktif — tersembunyi dari website'}
                    </p>
                  </div>
                  <button onClick={() => setEditPkg({ ...editPkg, is_active: !editPkg.is_active })}>
                    {editPkg.is_active
                      ? <ToggleRight className="w-8 h-8 text-jungle-light" />
                      : <ToggleLeft className="w-8 h-8 text-cream-muted" />
                    }
                  </button>
                </div>

                {/* Basic fields */}
                {[
                  { label: 'Judul Paket', key: 'title', type: 'text' },
                  { label: 'Subtitle', key: 'subtitle', type: 'text' },
                  { label: 'Cover Image URL', key: 'cover_image', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">{f.label}</label>
                    <input
                      value={((editPkg as unknown) as Record<string, unknown>)[f.key] as string || ''}
                      onChange={e => setEditPkg({ ...editPkg, [f.key]: e.target.value })}
                      className="input-dark w-full"
                    />
                  </div>
                ))}

                {/* Price + type row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Harga (USD)</label>
                    <input
                      type="number"
                      value={pkgPrice(editPkg)}
                      onChange={e => setEditPkg({ ...editPkg, price_usd: Number(e.target.value) })}
                      className="input-dark w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tipe</label>
                    <select
                      value={editPkg.type}
                      onChange={e => setEditPkg({ ...editPkg, type: e.target.value })}
                      className="input-dark w-full"
                    >
                      {['shared', 'private', 'luxury', 'honeymoon'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Durasi</label>
                    <input
                      value={editPkg.duration}
                      onChange={e => setEditPkg({ ...editPkg, duration: e.target.value })}
                      className="input-dark w-full"
                      placeholder="2D / 1N"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Kursi Tersedia</label>
                    <input
                      type="number"
                      value={pkgSeats(editPkg)}
                      onChange={e => setEditPkg({ ...editPkg, available_seats: Number(e.target.value) })}
                      className="input-dark w-full"
                    />
                  </div>
                </div>

                {/* Route description */}
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Deskripsi Rute</label>
                  <textarea
                    value={editPkg.route_description || editPkg.routeDescription || ''}
                    onChange={e => setEditPkg({ ...editPkg, route_description: e.target.value })}
                    className="input-dark w-full h-20 resize-none"
                  />
                </div>

                {/* Highlights */}
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Highlights (1 per baris)</label>
                  <textarea
                    value={parseArr(editPkg.highlights).join('\n')}
                    onChange={e => setEditPkg({ ...editPkg, highlights: e.target.value.split('\n').filter(Boolean) })}
                    className="input-dark w-full h-24 resize-none"
                  />
                </div>

                {/* Included */}
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Yang Termasuk (1 per baris)</label>
                  <textarea
                    value={parseArr(editPkg.included).join('\n')}
                    onChange={e => setEditPkg({ ...editPkg, included: e.target.value.split('\n').filter(Boolean) })}
                    className="input-dark w-full h-24 resize-none"
                  />
                </div>

                {/* Excluded */}
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tidak Termasuk (1 per baris)</label>
                  <textarea
                    value={parseArr(editPkg.excluded).join('\n')}
                    onChange={e => setEditPkg({ ...editPkg, excluded: e.target.value.split('\n').filter(Boolean) })}
                    className="input-dark w-full h-20 resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tags (pisah koma)</label>
                  <input
                    value={parseArr(editPkg.tags).join(', ')}
                    onChange={e => setEditPkg({ ...editPkg, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="input-dark w-full"
                    placeholder="Sunrise, Volcano, Multi-Day"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/25 text-xs text-blue-300">
                  Setelah disimpan, perubahan langsung tercermin di website utama.
                  Paket nonaktif tidak muncul di halaman /packages.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add new package drawer */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-volcanic-200 border-l border-white/8 overflow-y-auto"
            >
              <AddPackageForm onClose={() => setShowAdd(false)} onSaved={fetchPackages} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function AddPackageForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: '', subtitle: '', slug: '', coverImage: '',
    type: 'shared', duration: '', durationDays: 1,
    priceUsd: 0, priceIdr: 0, maxGroupSize: 13,
    availableSeats: 13, totalSeats: 13, routeDescription: '',
    highlights: '', included: '', excluded: '', tags: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug || !form.priceUsd) {
      setError('Judul, slug, dan harga wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          highlights: form.highlights.split('\n').filter(Boolean),
          included:   form.included.split('\n').filter(Boolean),
          excluded:   form.excluded.split('\n').filter(Boolean),
          tags:       form.tags.split(',').map(s => s.trim()).filter(Boolean),
          isActive:   true,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Gagal'); return }
      await onSaved()
      onClose()
    } catch { setError('Server error.') } finally { setSaving(false) }
  }

  return (
    <>
      <div className="sticky top-0 glass border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-cream">Tambah Paket Baru</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-cream-muted hover:text-cream">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-lava/15 border border-lava/25 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {[
          { label: 'Judul Paket *', key: 'title' },
          { label: 'Subtitle', key: 'subtitle' },
          { label: 'Slug (URL) *', key: 'slug', placeholder: 'bromo-sunrise-tour' },
          { label: 'Cover Image URL', key: 'coverImage' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">{f.label}</label>
            <input
              value={((form as unknown) as Record<string, unknown>)[f.key] as string}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="input-dark w-full"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Harga USD *</label>
            <input type="number" value={form.priceUsd} onChange={e => setForm({ ...form, priceUsd: Number(e.target.value) })} className="input-dark w-full" />
          </div>
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tipe</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-dark w-full">
              {['shared', 'private', 'luxury', 'honeymoon'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Durasi</label>
            <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="2D / 1N" className="input-dark w-full" />
          </div>
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Kursi</label>
            <input type="number" value={form.maxGroupSize} onChange={e => setForm({ ...form, maxGroupSize: Number(e.target.value), availableSeats: Number(e.target.value), totalSeats: Number(e.target.value) })} className="input-dark w-full" />
          </div>
        </div>

        {[
          { label: 'Highlights (1 per baris)', key: 'highlights', rows: 3 },
          { label: 'Yang Termasuk (1 per baris)', key: 'included', rows: 3 },
          { label: 'Tidak Termasuk (1 per baris)', key: 'excluded', rows: 3 },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">{f.label}</label>
            <textarea
              value={((form as unknown) as Record<string, unknown>)[f.key] as string}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              rows={f.rows}
              className="input-dark w-full resize-none"
            />
          </div>
        ))}

        <div>
          <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tags (pisah koma)</label>
          <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Sunrise, Volcano" className="input-dark w-full" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3.5">
          {saving ? 'Menyimpan...' : 'Simpan Paket Baru'}
        </button>
      </form>
    </>
  )
}
