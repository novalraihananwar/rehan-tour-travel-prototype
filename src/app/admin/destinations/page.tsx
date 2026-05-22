'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit3, Trash2, X, Save, Eye, EyeOff, MapPin, Search, ImageIcon } from 'lucide-react'

interface Destination {
  id: string
  slug: string
  name: string
  region: string
  tagline?: string
  description?: string
  image?: string
  hero_image?: string
  category?: string
  difficulty?: string
  duration?: string
  best_season?: string
  highlights?: string[]
  featured: boolean
  is_active: boolean
  created_at: string
}

const EMPTY: Omit<Destination, 'id' | 'created_at'> = {
  slug: '', name: '', region: '', tagline: '', description: '',
  image: '', hero_image: '', category: '', difficulty: 'Moderate',
  duration: '', best_season: '', highlights: [], featured: false, is_active: true,
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminDestinationsPage() {
  const [items, setItems] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [editId, setEditId] = useState<string | null>(null)
  const [highlightsInput, setHighlightsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/destinations')
      const d = await r.json()
      setItems(d.destinations || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm({ ...EMPTY })
    setHighlightsInput('')
    setEditId(null)
    setMsg('')
    setModal('add')
  }

  const openEdit = (d: Destination) => {
    setForm({
      slug: d.slug, name: d.name, region: d.region,
      tagline: d.tagline || '', description: d.description || '',
      image: d.image || '', hero_image: d.hero_image || '',
      category: d.category || '', difficulty: d.difficulty || 'Moderate',
      duration: d.duration || '', best_season: d.best_season || '',
      highlights: d.highlights || [], featured: d.featured, is_active: d.is_active,
    })
    setHighlightsInput((d.highlights || []).join(', '))
    setEditId(d.id)
    setMsg('')
    setModal('edit')
  }

  const save = async () => {
    if (!form.name || !form.region) { setMsg('Nama dan region wajib diisi'); return }
    setSaving(true); setMsg('')
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        highlights: highlightsInput.split(',').map(h => h.trim()).filter(Boolean),
        ...(modal === 'edit' ? { id: editId } : {}),
      }
      const r = await fetch('/api/admin/destinations', {
        method: modal === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (!r.ok) { setMsg(d.error || 'Gagal menyimpan'); return }
      setMsg('Tersimpan!')
      await load()
      setTimeout(() => setModal(null), 700)
    } finally { setSaving(false) }
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`Hapus destinasi "${name}"?`)) return
    const r = await fetch('/api/admin/destinations', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if ((await r.json()).ok) setItems(p => p.filter(x => x.id !== id))
    else alert('Gagal hapus')
  }

  const toggleActive = async (d: Destination) => {
    const r = await fetch('/api/admin/destinations', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, is_active: !d.is_active }),
    })
    if (r.ok) setItems(p => p.map(x => x.id === d.id ? { ...x, is_active: !x.is_active } : x))
  }

  const filtered = items.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !search || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q)
    const matchRegion = regionFilter === 'all' || d.region.toLowerCase().replace(/\s+/g, '-') === regionFilter
    return matchSearch && matchRegion
  })

  const regions = ['all', ...Array.from(new Set(items.map(d => d.region.toLowerCase().replace(/\s+/g, '-'))))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Destinations</h1>
          <p className="text-sm text-cream-muted mt-0.5">{items.length} destinasi terdaftar</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Destinasi
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, region..." className="input-dark pl-9 text-sm w-60" />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {regions.map(r => (
            <button key={r} onClick={() => setRegionFilter(r)}
              className={`px-4 py-2 text-xs font-medium transition-all capitalize ${regionFilter === r ? 'bg-sunset text-volcanic' : 'text-cream-muted hover:text-cream'}`}>
              {r === 'all' ? 'Semua' : r.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-52 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <MapPin className="w-8 h-8 text-cream-muted mx-auto mb-3" />
          <p className="text-cream-muted text-sm">{items.length === 0 ? 'Belum ada destinasi.' : 'Tidak ada yang cocok.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`glass-card rounded-2xl overflow-hidden hover:border-sunset/20 transition-all ${!d.is_active ? 'opacity-60' : ''}`}>
              <div className="relative h-36 bg-volcanic-400">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-cream-muted opacity-30" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic/80 to-transparent" />
                {d.featured && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold/90 text-volcanic text-[10px] font-bold">Featured</span>}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] ${d.is_active ? 'bg-jungle/80 text-jungle-light' : 'bg-white/10 text-cream-muted'}`}>
                  {d.is_active ? 'Aktif' : 'Draft'}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-cream truncate">{d.name}</p>
                <p className="text-xs text-cream-muted">{d.region} · {d.difficulty}</p>
                {d.tagline && <p className="text-xs text-sunset/80 italic truncate mt-0.5">&ldquo;{d.tagline}&rdquo;</p>}
                <p className="text-[10px] text-cream-muted font-mono mt-1">/{d.slug}</p>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => openEdit(d)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-white/10 text-cream-muted hover:text-cream hover:border-sunset/30 transition-colors text-xs">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => toggleActive(d)} className="px-3 py-1.5 rounded-xl border border-white/10 text-cream-muted hover:text-cream hover:border-white/25 transition-colors" title={d.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                  {d.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => del(d.id, d.name)} className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-volcanic-200 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-volcanic-200 px-6 py-4 border-b border-white/8 flex items-center justify-between z-10">
                <h2 className="font-display text-lg text-cream">{modal === 'add' ? 'Tambah Destinasi' : 'Edit Destinasi'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-cream-muted hover:text-cream hover:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Nama *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: modal === 'add' ? slugify(e.target.value) : f.slug }))} placeholder="Mount Bromo" className="input-dark w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Slug</label>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} placeholder="mount-bromo" className="input-dark w-full text-sm font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Region *</label>
                    <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="input-dark w-full text-sm appearance-none">
                      <option value="">Pilih region...</option>
                      <option value="East Java">East Java</option>
                      <option value="Bali">Bali</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Difficulty</label>
                    <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="input-dark w-full text-sm appearance-none">
                      <option>Easy</option>
                      <option>Moderate</option>
                      <option>Challenging</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tagline</label>
                  <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Where the Sea of Sand meets the Sky" className="input-dark w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Deskripsi</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-dark w-full text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Image URL (card)</label>
                    <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className="input-dark w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Hero Image URL</label>
                    <input value={form.hero_image} onChange={e => setForm(f => ({ ...f, hero_image: e.target.value }))} placeholder="https://..." className="input-dark w-full text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Kategori</label>
                    <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Volcano" className="input-dark w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Duration</label>
                    <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="1-2 days" className="input-dark w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Best Season</label>
                    <input value={form.best_season} onChange={e => setForm(f => ({ ...f, best_season: e.target.value }))} placeholder="April – Oct" className="input-dark w-full text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Highlights (pisahkan koma)</label>
                  <input value={highlightsInput} onChange={e => setHighlightsInput(e.target.value)} placeholder="Sunrise view, Sea of sand, Crater lake" className="input-dark w-full text-sm" />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-sunset" />
                    <span className="text-sm text-cream-muted">Aktif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-gold" />
                    <span className="text-sm text-cream-muted">Featured</span>
                  </label>
                </div>
                {msg && <p className={`text-sm font-medium ${msg.includes('!') ? 'text-jungle-light' : 'text-red-400'}`}>{msg}</p>}
                <div className="flex gap-3 pt-2">
                  <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60">
                    <Save className="w-4 h-4" />{saving ? 'Menyimpan...' : modal === 'add' ? 'Tambah' : 'Simpan'}
                  </button>
                  <button onClick={() => setModal(null)} className="border border-white/10 text-cream-muted hover:text-cream rounded-xl px-5 py-2.5 text-sm transition-colors">Batal</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
