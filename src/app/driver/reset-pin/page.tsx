'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react'

// ── Inner component (needs useSearchParams) ───────────────────────────────────

function ResetPinForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [newPin, setNewPin]           = useState('')
  const [confirmPin, setConfirmPin]   = useState('')
  const [showPin, setShowPin]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [done, setDone]               = useState(false)

  const validate = (): string => {
    if (!token) return 'Token tidak ditemukan. Minta link reset baru.'
    if (!/^\d{6}$/.test(newPin)) return 'PIN harus 6 digit angka.'
    if (newPin !== confirmPin) return 'Konfirmasi PIN tidak cocok.'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/driver/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Coba lagi.')
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError('Koneksi gagal. Coba lagi.')
      setLoading(false)
    }
  }

  if (!token) {
    return <InvalidTokenCard onBack={() => router.push('/driver/forgot-pin')} />
  }

  if (done) {
    return <SuccessCard onLogin={() => router.push('/driver/login')} />
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
        <p className="text-sm text-cream-muted leading-relaxed">
          Masukkan PIN baru kamu. PIN harus 6 digit angka.
        </p>

        {/* New PIN */}
        <div>
          <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
            PIN Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
            <input
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              type={showPin ? 'text' : 'password'}
              placeholder="••••••"
              inputMode="numeric"
              maxLength={6}
              required
              className="input-dark pl-10 pr-10 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm PIN */}
        <div>
          <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
            Konfirmasi PIN Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
            <input
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••"
              inputMode="numeric"
              maxLength={6}
              required
              className="input-dark pl-10 pr-10 w-full"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-lava/15 border border-lava/25 text-sm text-red-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-volcanic/30 border-t-volcanic rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <Lock className="w-4 h-4" />
              Simpan PIN Baru
            </span>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-cream-muted mt-4">
        <button
          onClick={() => router.push('/driver/forgot-pin')}
          className="text-cream-muted hover:text-gold transition-colors hover:underline"
        >
          Minta link reset baru
        </button>
      </p>
    </>
  )
}

// ── Status cards ──────────────────────────────────────────────────────────────

function SuccessCard({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-6 text-center space-y-4"
    >
      <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-7 h-7 text-green-400" />
      </div>
      <h2 className="font-display text-xl text-cream">PIN Berhasil Diubah!</h2>
      <p className="text-sm text-cream-muted leading-relaxed">
        PIN kamu berhasil diubah! Silakan login dengan PIN baru.
      </p>
      <button
        onClick={onLogin}
        className="btn-primary w-full justify-center py-3 mt-2"
      >
        Login Sekarang
      </button>
    </motion.div>
  )
}

function InvalidTokenCard({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-6 text-center space-y-4"
    >
      <div className="w-14 h-14 rounded-full bg-lava/10 border border-lava/30 flex items-center justify-center mx-auto">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <h2 className="font-display text-xl text-cream">Link Tidak Valid</h2>
      <p className="text-sm text-cream-muted leading-relaxed">
        Link sudah expired atau tidak valid. Minta link baru.
      </p>
      <button
        onClick={onBack}
        className="btn-primary w-full justify-center py-3 mt-2"
      >
        Minta Link Baru
      </button>
    </motion.div>
  )
}

// ── Page (Suspense boundary for useSearchParams) ──────────────────────────────

export default function ResetPinPage() {
  return (
    <div className="min-h-screen bg-volcanic flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset to-gold flex items-center justify-center mx-auto mb-4 shadow-glow-sunset">
            <Navigation className="w-8 h-8 text-volcanic" />
          </div>
          <h1 className="font-display text-2xl text-cream mb-1">Reset PIN</h1>
          <p className="text-sm text-cream-muted">Rehan Tour &amp; Travel</p>
        </div>

        <Suspense
          fallback={
            <div className="glass-card rounded-2xl p-6 text-center">
              <span className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin inline-block" />
            </div>
          }
        >
          <ResetPinForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
