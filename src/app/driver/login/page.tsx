'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, User, Eye, EyeOff, AlertCircle, Navigation } from 'lucide-react'

export default function DriverLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [pin, setPin]           = useState('')
  const [showPin, setShowPin]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/driver/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal.')
        setLoading(false)
        return
      }

      localStorage.setItem('driver_session', JSON.stringify({
        ...data.driver,
        loginAt: Date.now(),
      }))

      router.push('/driver/dashboard')
    } catch {
      setError('Koneksi gagal. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-volcanic flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset to-gold flex items-center justify-center mx-auto mb-4 shadow-glow-sunset">
            <Navigation className="w-8 h-8 text-volcanic" />
          </div>
          <h1 className="font-display text-2xl text-cream mb-1">Driver Portal</h1>
          <p className="text-sm text-cream-muted">Rehan Tour &amp; Travel</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="glass-card rounded-2xl p-6 space-y-4">

          {/* Username */}
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="budi.santoso"
                autoComplete="username"
                required
                className="input-dark pl-10 w-full"
              />
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">
              PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
              <input
                value={pin}
                onChange={e => setPin(e.target.value)}
                type={showPin ? 'text' : 'password'}
                placeholder="••••••"
                autoComplete="current-password"
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
                Masuk...
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Demo hint */}
        <p className="text-center text-xs text-cream-muted mt-4">
          Demo: username <span className="text-cream font-mono">demo</span> · PIN <span className="text-cream font-mono">1234</span>
        </p>

        <p className="text-center text-xs text-cream-muted mt-2">
          Lupa PIN? Hubungi admin Rehan Tour &amp; Travel
        </p>

        <p className="text-center text-xs text-cream-muted mt-3">
          Belum punya akun?{' '}
          <button
            onClick={() => router.push('/driver/register')}
            className="text-gold hover:underline"
          >
            Daftar sebagai driver
          </button>
        </p>
      </motion.div>
    </div>
  )
}
