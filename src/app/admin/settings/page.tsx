'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Phone, Mail, MapPin, Instagram, Facebook, Youtube, Megaphone, AlertTriangle, Settings } from 'lucide-react'

interface SiteSettings {
  site_name?: string
  site_tagline?: string
  contact_phone?: string
  contact_whatsapp?: string
  contact_email?: string
  contact_address?: string
  social_instagram?: string
  social_facebook?: string
  social_tiktok?: string
  social_youtube?: string
  hero_title?: string
  hero_subtitle?: string
  meta_description?: string
  booking_deposit_percent?: number
  booking_currency?: string
  maintenance_mode?: boolean
  announcement_banner?: boolean
  announcement_text?: string
}

const S = 'glass-card rounded-2xl p-6 space-y-4'
const L = 'text-xs text-cream-muted uppercase tracking-wider block mb-1.5'
const I = 'input-dark w-full text-sm'

export default function AdminSettingsPage() {
  const [cfg, setCfg] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => setCfg(d.settings || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setCfg(p => ({ ...p, [k]: v }))

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      })
      const d = await r.json()
      setMsg(r.ok ? 'Pengaturan berhasil disimpan!' : d.error || 'Gagal menyimpan')
      if (r.ok) setTimeout(() => setMsg(''), 3000)
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="space-y-6 max-w-3xl">
      <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
      {[...Array(4)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-48 animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Pengaturan Situs</h1>
          <p className="text-sm text-cream-muted mt-0.5">Konfigurasi global website Rehan Tour & Travel</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60">
          <Save className="w-4 h-4" />{saving ? 'Menyimpan...' : 'Simpan Semua'}
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${msg.includes('berhasil') ? 'bg-jungle/10 border-jungle/25 text-jungle-light' : 'bg-red-900/10 border-red-500/25 text-red-400'}`}>{msg}</div>
      )}

      {/* Identitas */}
      <div className={S}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/8">
          <Globe className="w-4 h-4 text-sunset" />
          <h2 className="text-sm font-medium text-cream">Identitas Situs</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={L}>Nama Situs</label><input value={cfg.site_name || ''} onChange={e => set('site_name', e.target.value)} placeholder="Rehan Tour & Travel" className={I} /></div>
          <div><label className={L}>Tagline</label><input value={cfg.site_tagline || ''} onChange={e => set('site_tagline', e.target.value)} placeholder="East Java's Premier Tour" className={I} /></div>
        </div>
        <div><label className={L}>Meta Description (SEO)</label><textarea value={cfg.meta_description || ''} onChange={e => set('meta_description', e.target.value)} rows={2} className={`${I} resize-none`} /></div>
        <div><label className={L}>Hero Title</label><input value={cfg.hero_title || ''} onChange={e => set('hero_title', e.target.value)} className={I} /></div>
        <div><label className={L}>Hero Subtitle</label><input value={cfg.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} className={I} /></div>
      </div>

      {/* Kontak */}
      <div className={S}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/8">
          <Phone className="w-4 h-4 text-jungle-light" />
          <h2 className="text-sm font-medium text-cream">Informasi Kontak</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={L}><Phone className="w-3 h-3 inline mr-1" />Telepon</label><input value={cfg.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} placeholder="+62 812 3456 7890" className={I} /></div>
          <div><label className={L}><Phone className="w-3 h-3 inline mr-1" />WhatsApp (angka saja)</label><input value={cfg.contact_whatsapp || ''} onChange={e => set('contact_whatsapp', e.target.value)} placeholder="6281234567890" className={I} /></div>
          <div><label className={L}><Mail className="w-3 h-3 inline mr-1" />Email</label><input type="email" value={cfg.contact_email || ''} onChange={e => set('contact_email', e.target.value)} placeholder="info@rehantour.id" className={I} /></div>
          <div><label className={L}><MapPin className="w-3 h-3 inline mr-1" />Alamat</label><input value={cfg.contact_address || ''} onChange={e => set('contact_address', e.target.value)} placeholder="Jl. Bromo No.1, Surabaya" className={I} /></div>
        </div>
      </div>

      {/* Social Media */}
      <div className={S}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/8">
          <Instagram className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-medium text-cream">Social Media</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={L}><Instagram className="w-3 h-3 inline mr-1" />Instagram</label><input value={cfg.social_instagram || ''} onChange={e => set('social_instagram', e.target.value)} placeholder="@rehantour" className={I} /></div>
          <div><label className={L}><Facebook className="w-3 h-3 inline mr-1" />Facebook</label><input value={cfg.social_facebook || ''} onChange={e => set('social_facebook', e.target.value)} className={I} /></div>
          <div><label className={L}>TikTok</label><input value={cfg.social_tiktok || ''} onChange={e => set('social_tiktok', e.target.value)} placeholder="@rehantour" className={I} /></div>
          <div><label className={L}><Youtube className="w-3 h-3 inline mr-1" />YouTube</label><input value={cfg.social_youtube || ''} onChange={e => set('social_youtube', e.target.value)} className={I} /></div>
        </div>
      </div>

      {/* Booking config */}
      <div className={S}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/8">
          <Settings className="w-4 h-4 text-ocean-light" />
          <h2 className="text-sm font-medium text-cream">Konfigurasi Booking</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={L}>Deposit (%)</label>
            <input type="number" min={0} max={100} value={cfg.booking_deposit_percent ?? 30} onChange={e => set('booking_deposit_percent', Number(e.target.value))} className={I} />
            <p className="text-[11px] text-cream-muted mt-1">Persentase DP saat booking</p>
          </div>
          <div>
            <label className={L}>Mata Uang Utama</label>
            <select value={cfg.booking_currency || 'USD'} onChange={e => set('booking_currency', e.target.value)} className={`${I} appearance-none`}>
              <option value="USD">USD — US Dollar</option>
              <option value="IDR">IDR — Indonesian Rupiah</option>
              <option value="EUR">EUR — Euro</option>
              <option value="SGD">SGD — Singapore Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcement & Maintenance */}
      <div className={S}>
        <div className="flex items-center gap-2 pb-2 border-b border-white/8">
          <Megaphone className="w-4 h-4 text-sunset" />
          <h2 className="text-sm font-medium text-cream">Announcement & Maintenance</h2>
        </div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div onClick={() => set('announcement_banner', !cfg.announcement_banner)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${cfg.announcement_banner ? 'bg-sunset' : 'bg-white/15'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${cfg.announcement_banner ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm text-cream-muted group-hover:text-cream transition-colors">Tampilkan announcement banner</span>
        </label>
        {cfg.announcement_banner && (
          <div>
            <label className={L}>Teks Announcement</label>
            <input value={cfg.announcement_text || ''} onChange={e => set('announcement_text', e.target.value)} placeholder="Promo spesial! Diskon 20%..." className={I} />
          </div>
        )}
        <div className="border-t border-white/8 pt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => set('maintenance_mode', !cfg.maintenance_mode)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${cfg.maintenance_mode ? 'bg-red-500' : 'bg-white/15'}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${cfg.maintenance_mode ? 'translate-x-5' : ''}`} />
            </div>
            <div>
              <span className="text-sm text-cream-muted group-hover:text-cream transition-colors">Maintenance Mode</span>
              {cfg.maintenance_mode && <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Website tidak bisa diakses saat ini</p>}
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4 pb-6">
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-60">
          <Save className="w-4 h-4" />{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
        {msg && <span className={`text-sm font-medium ${msg.includes('berhasil') ? 'text-jungle-light' : 'text-red-400'}`}>{msg}</span>}
      </div>
    </div>
  )
}
