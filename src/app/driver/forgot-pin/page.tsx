'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, User, Mail, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(username: string, email: string): string {
  if (!username.trim()) return 'Username tidak boleh kosong.'
  if (!email.trim()) return 'Email tidak boleh kosong.'
  if (!EMAIL_REGEX.test(email)) return 'Format email tidak valid.'
  return ''
}

export default function ForgotPinPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate(username, email)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/driver/forgot-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
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
          <h1 className="font-display text-2xl text-cream mb-1">Lupa PIN</h1>
          <p className="text-sm text-cream-muted">Rehan Tour &amp; Travel</p>
        </div>

        {done ? (
          <SuccessCard onBack={() => router.push('/driver/login')} />
        ) : (
          <ForgotPinForm
            username={username}
            email={email}
            loading={loading}
            error={error}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onSubmit={handleSubmit}
            onBack={() => router.push('/driver/login')}
          />
        )}
      </motion.div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface FormProps {
  username: string
  email: string
  loading: boolean
  error: string
  onUsernameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

function ForgotPinForm({
  username, email, loading, error,
  onUsernameChange, onEmailChange, onSubmit, onBack,
}: FormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="glass-card rounded-2xl p-6 space-y-4">
        <p className="text-sm text-cream-muted leading-relaxed">
          Masukkan username dan email yang terdaftar. Kami akan kirim link reset PIN ke email kamu.
        </p>

        {/* Username */}
        <div>
          <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
            <input
              value={username}
              onChange={e => onUsernameChange(e.target.value)}
              placeholder="budi.santoso"
              autoComplete="username"
              required
              className="input-dark pl-10 w-full"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
            <input
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              type="email"
              placeholder="driver@email.com"
              autoComplete="email"
              required
              className="input-dark pl-10 w-full"
            />
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
              Mengirim...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <Lock className="w-4 h-4" />
              Kirim Link Reset
            </span>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-cream-muted mt-4">
        <button
          onClick={onBack}
          className="text-cream-muted hover:text-gold transition-colors hover:underline"
        >
          Kembali ke Login
        </button>
      </p>
    </>
  )
}

function SuccessCard({ onBack }: { onBack: () => void }) {
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
      <h2 className="font-display text-xl text-cream">Email Terkirim!</h2>
      <p className="text-sm text-cream-muted leading-relaxed">
        Link reset PIN sudah dikirim ke email kamu. Cek inbox atau folder spam.
      </p>
      <p className="text-xs text-cream-muted">
        Link berlaku selama <span className="text-gold">1 jam</span>.
      </p>
      <button
        onClick={onBack}
        className="btn-primary w-full justify-center py-3 mt-2"
      >
        Kembali ke Login
      </button>
    </motion.div>
  )
}
