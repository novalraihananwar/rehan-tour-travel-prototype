'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, Lock, ChevronRight, ChevronLeft,
  Navigation, AlertCircle, CheckCircle2, Eye, EyeOff,
} from 'lucide-react'

type FormData = {
  name: string
  phone: string
  username: string
  pin: string
  confirmPin: string
}

const STEPS = ['Data Diri', 'Akun']

export default function DriverRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    name: '', phone: '', username: '', pin: '', confirmPin: '',
  })
  const [showPin, setShowPin]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(false)

  const set = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (error) setError('')
  }

  const handleNameBlur = () => {
    if (form.name && !form.username) {
      const generated = form.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z.]/g, '')
      set('username', generated)
    }
  }

  const validateStep = (): string => {
    if (step === 0) {
      if (!form.name.trim()) return 'Nama lengkap wajib diisi.'
      if (!form.phone.trim()) return 'Nomor HP wajib diisi.'
      if (!/^0[0-9]{9,12}$/.test(form.phone.replace(/\s/g, '')))
        return 'Format nomor HP tidak valid. Contoh: 081234567890'
    }
    if (step === 1) {
      if (!form.username.trim()) return 'Username wajib diisi.'
      if (!/^[a-z][a-z0-9._]{2,29}$/.test(form.username))
        return 'Username: huruf kecil, angka, titik, underscore (3–30 karakter).'
      if (form.pin.length < 6) return 'PIN minimal 6 digit.'
      if (!/^\d+$/.test(form.pin)) return 'PIN hanya boleh angka.'
      if (form.pin !== form.confirmPin) return 'PIN dan konfirmasi PIN tidak cocok.'
    }
    return ''
  }

  const next = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  const back = () => {
    setError('')
    setStep(s => s - 1)
  }

  const submit = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/driver/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.replace(/\s/g, ''),
          username: form.username.trim(),
          pin: form.pin,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Pendaftaran gagal.')
        setLoading(false)
        return
      }
      setDone(true)
    } catch {
      setError('Koneksi gagal. Coba lagi.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-volcanic flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm text-center relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl text-cream mb-3">Pendaftaran Terkirim!</h2>
          <p className="text-cream-muted text-sm leading-relaxed mb-2">
            Data kamu sudah diterima oleh admin Rehan Tour &amp; Travel.
          </p>
          <p className="text-cream-muted text-sm leading-relaxed mb-8">
            Kami akan menghubungi kamu melalui WhatsApp{' '}
            <span className="text-cream font-medium">{form.phone}</span>{' '}
            dalam 1×24 jam untuk konfirmasi akun.
          </p>
          <button
            onClick={() => router.push('/driver/login')}
            className="btn-primary w-full justify-center py-3.5"
          >
            Kembali ke Login
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-volcanic flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset to-gold flex items-center justify-center mx-auto mb-4 shadow-glow-sunset">
            <Navigation className="w-8 h-8 text-volcanic" />
          </div>
          <h1 className="font-display text-2xl text-cream mb-1">Daftar Driver</h1>
          <p className="text-sm text-cream-muted">Rehan Tour &amp; Travel</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                i === step ? 'text-gold' : i < step ? 'text-emerald-400' : 'text-cream-muted'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  i === step
                    ? 'border-gold bg-gold/20 text-gold scale-110'
                    : i < step
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                    : 'border-cream-muted/30 text-cream-muted'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px transition-colors ${i < step ? 'bg-emerald-400/50' : 'bg-cream-muted/20'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-6">
          <AnimatePresence mode="wait">

            {/* Step 0 — Data Diri */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-xs text-cream-muted uppercase tracking-wider font-semibold mb-4">
                  Data Diri
                </h2>

                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      onBlur={handleNameBlur}
                      placeholder="Budi Santoso"
                      autoComplete="name"
                      className="input-dark pl-10 w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
                    Nomor HP / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input
                      value={form.phone}
                      onChange={e => set('phone', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="081234567890"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className="input-dark pl-10 w-full"
                    />
                  </div>
                  <p className="text-[11px] text-cream-muted mt-1.5">
                    Admin akan menghubungi nomor ini untuk konfirmasi.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 1 — Akun */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-xs text-cream-muted uppercase tracking-wider font-semibold mb-4">
                  Data Akun
                </h2>

                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input
                      value={form.username}
                      onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      placeholder="budi.santoso"
                      autoComplete="username"
                      className="input-dark pl-10 w-full"
                    />
                  </div>
                  <p className="text-[11px] text-cream-muted mt-1.5">
                    Huruf kecil, angka, titik. Dipakai saat login.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
                    PIN (6 digit)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input
                      value={form.pin}
                      onChange={e => set('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      placeholder="••••••"
                      autoComplete="new-password"
                      className="input-dark pl-10 pr-10 w-full tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
                    Konfirmasi PIN
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input
                      value={form.confirmPin}
                      onChange={e => set('confirmPin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      type={showConfirm ? 'text' : 'password'}
                      inputMode="numeric"
                      placeholder="••••••"
                      autoComplete="new-password"
                      className="input-dark pl-10 pr-10 w-full tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-xl bg-lava/15 border border-lava/25 text-sm text-red-300 mt-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                onClick={back}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-cream-muted/20 text-cream-muted hover:text-cream hover:border-cream-muted/40 transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Kembali
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="btn-primary flex-1 justify-center py-3 flex items-center gap-2"
              >
                Lanjut
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="btn-primary flex-1 justify-center py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-volcanic/30 border-t-volcanic rounded-full animate-spin" />
                    Mendaftar...
                  </span>
                ) : (
                  'Kirim Pendaftaran'
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-cream-muted mt-4">
          Sudah punya akun?{' '}
          <button
            onClick={() => router.push('/driver/login')}
            className="text-gold hover:underline"
          >
            Login di sini
          </button>
        </p>
      </motion.div>
    </div>
  )
}
