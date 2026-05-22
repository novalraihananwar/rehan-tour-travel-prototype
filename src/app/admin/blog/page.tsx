'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit3, Trash2, X, Save, Eye, EyeOff, BookOpen, Search, ImageIcon, Calendar } from 'lucide-react'

interface Post {
  id: string
  slug: string
  title: string
  excerpt?: string
  content?: string
  cover_image?: string
  author: string
  category?: string
  tags?: string[]
  is_published: boolean
  published_at?: string
  created_at: string
}

const EMPTY = {
  slug: '', title: '', excerpt: '', content: '', cover_image: '',
  author: 'Admin', category: '', tags: [] as string[], is_published: false,
}

const CATEGORIES = ['Tips & Guide', 'Destination', 'Culture', 'Food', 'Adventure', 'Photography', 'News']

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [editId, setEditId] = useState<string | null>(null)
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/blog')
      const d = await r.json()
      setPosts(d.posts || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm({ ...EMPTY })
    setTagsInput('')
    setEditId(null)
    setMsg('')
    setModal('add')
  }

  const openEdit = (p: Post) => {
    setForm({
      slug: p.slug, title: p.title, excerpt: p.excerpt || '',
      content: p.content || '', cover_image: p.cover_image || '',
      author: p.author, category: p.category || '',
      tags: p.tags || [], is_published: p.is_published,
    })
    setTagsInput((p.tags || []).join(', '))
    setEditId(p.id)
    setMsg('')
    setModal('edit')
  }

  const save = async () => {
    if (!form.title) { setMsg('Judul wajib diisi'); return }
    setSaving(true); setMsg('')
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        ...(modal === 'edit' ? { id: editId } : {}),
      }
      const r = await fetch('/api/admin/blog', {
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

  const del = async (id: string, title: string) => {
    if (!confirm(`Hapus post "${title}"?`)) return
    const r = await fetch('/api/admin/blog', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if ((await r.json()).ok) setPosts(p => p.filter(x => x.id !== id))
    else alert('Gagal hapus')
  }

  const togglePublish = async (p: Post) => {
    const r = await fetch('/api/admin/blog', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, is_published: !p.is_published }),
    })
    if (r.ok) setPosts(prev => prev.map(x => x.id === p.id ? { ...x, is_published: !x.is_published } : x))
  }

  const filtered = posts.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !search || p.title.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' ? true : statusFilter === 'published' ? p.is_published : !p.is_published
    return matchSearch && matchStatus
  })

  const pub = posts.filter(p => p.is_published).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Blog Posts</h1>
          <p className="text-sm text-cream-muted mt-0.5">{pub} published · {posts.length - pub} draft</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Tulis Post Baru
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ l: 'Total', v: posts.length, c: 'text-cream' }, { l: 'Published', v: pub, c: 'text-jungle-light' }, { l: 'Draft', v: posts.length - pub, c: 'text-gold' }].map(s => (
          <div key={s.l} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold font-display ${s.c}`}>{s.v}</p>
            <p className="text-xs text-cream-muted">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul, kategori..." className="input-dark pl-9 text-sm w-60" />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {(['all', 'published', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 text-xs font-medium transition-all capitalize ${statusFilter === f ? 'bg-sunset text-volcanic' : 'text-cream-muted hover:text-cream'}`}>
              {f === 'all' ? 'Semua' : f === 'published' ? 'Published' : 'Draft'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-24 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <BookOpen className="w-8 h-8 text-cream-muted mx-auto mb-3" />
          <p className="text-cream-muted text-sm">{posts.length === 0 ? 'Belum ada post.' : 'Tidak ada yang cocok.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`glass-card rounded-2xl overflow-hidden hover:border-sunset/20 transition-all ${!p.is_published ? 'opacity-70' : ''}`}>
              <div className="flex items-center gap-4 p-4">
                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-volcanic-400">
                  {p.cover_image ? <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-cream-muted opacity-30" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${p.is_published ? 'bg-jungle/15 text-jungle-light border-jungle/25' : 'bg-white/5 text-cream-muted border-white/10'}`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                    {p.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sunset/10 text-sunset border border-sunset/20">{p.category}</span>}
                  </div>
                  <p className="text-sm font-medium text-cream truncate">{p.title}</p>
                  <p className="text-xs text-cream-muted font-mono">/{p.slug}</p>
                  <p className="text-[11px] text-cream-muted flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => togglePublish(p)} className={`p-2 rounded-xl border transition-colors ${p.is_published ? 'border-jungle/20 text-jungle-light hover:bg-jungle/10' : 'border-white/10 text-cream-muted hover:text-cream'}`} title={p.is_published ? 'Unpublish' : 'Publish'}>
                    {p.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-xl border border-white/10 text-cream-muted hover:text-cream hover:border-sunset/30 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => del(p.id, p.title)} className="p-2 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
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
                <h2 className="font-display text-lg text-cream">{modal === 'add' ? 'Tulis Post Baru' : 'Edit Post'}</h2>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-cream-muted hover:text-cream hover:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Judul *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: modal === 'add' ? slugify(e.target.value) : f.slug }))} placeholder="10 Alasan Mengunjungi Bromo" className="input-dark w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Slug</label>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} className="input-dark w-full text-sm font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Author</label>
                    <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="input-dark w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Kategori</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-dark w-full text-sm appearance-none">
                      <option value="">Pilih...</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Excerpt</label>
                  <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} placeholder="Ringkasan singkat..." className="input-dark w-full text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Konten</label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} placeholder="Isi artikel lengkap..." className="input-dark w-full text-sm resize-none font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Cover Image URL</label>
                  <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." className="input-dark w-full text-sm" />
                  {form.cover_image && <img src={form.cover_image} alt="" className="mt-2 h-20 w-full rounded-xl object-cover" />}
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Tags (pisahkan koma)</label>
                  <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="bromo, sunrise, travel" className="input-dark w-full text-sm" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-jungle" />
                  <span className="text-sm text-cream-muted">Publish sekarang</span>
                </label>
                {msg && <p className={`text-sm font-medium ${msg.includes('!') ? 'text-jungle-light' : 'text-red-400'}`}>{msg}</p>}
                <div className="flex gap-3 pt-2">
                  <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60">
                    <Save className="w-4 h-4" />{saving ? 'Menyimpan...' : modal === 'add' ? 'Buat Post' : 'Simpan'}
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
