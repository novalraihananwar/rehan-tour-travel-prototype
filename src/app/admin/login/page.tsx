'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react'

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 30

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  // BUG-3 fix: checking state prevents flash of login form when already authenticated
  const [checking, setChecking] = useState(true)
  // BUG-4 fix: rate limiting state
  const [failCount, setFailCount] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [lockCountdown, setLockCountdown] = useState(0)

  // BUG-3 fix: check auth first, show nothing until check is done
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') === 'true') {
      router.replace('/admin')
    } else {
      setChecking(false)
    }
  }, [router])

  // BUG-4 fix: countdown timer while locked out
  useEffect(() => {
    if (lockedUntil === null) return
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setFailCount(0)
        setLockCountdown(0)
      } else {
        setLockCountdown(remaining)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [lockedUntil])

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const handleLogin = async () => {
    if (isLocked) return

    setLoading(true)
    setError(false)

    try {
      // BUG-1 fix: validate password via server API, not client-side comparison
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        localStorage.setItem('admin_auth', 'true')
        // BUG-2 fix: router.push is non-blocking; keep loading=true intentionally
        // during navigation but reset if navigation fails or is slow
        router.push('/admin')
        // Give navigation a moment; if it hasn't completed in 3s, re-enable button
        setTimeout(() => setLoading(false), 3000)
      } else {
        // BUG-4 fix: increment fail counter, lock after MAX_ATTEMPTS
        const newCount = failCount + 1
        setFailCount(newCount)
        if (newCount >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000)
          setLockCountdown(LOCKOUT_SECONDS)
        }
        setError(true)
        // BUG-2 fix: always reset loading on failure
        setLoading(false)
      }
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  // BUG-3 fix: render nothing while checking auth to prevent flash
  if (checking) return null

  return (
    <div className="min-h-screen bg-volcanic flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-sunset to-gold rounded-2xl flex items-center justify-center mb-4 shadow-glow-sunset">
            <span className="text-volcanic font-bold font-display text-2xl">R</span>
          </div>
          <h1 className="font-display text-2xl text-cream">Admin Panel</h1>
          <p className="text-sm text-cream-muted mt-1">Rehan Tour & Travel</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-sunset/15 flex items-center justify-center">
              <Lock className="w-4 h-4 text-sunset" />
            </div>
            <div>
              <p className="text-sm font-medium text-cream">Secure Login</p>
              <p className="text-xs text-cream-muted">Enter admin password to continue</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false) }}
                  onKeyDown={handleKeyDown}
                  disabled={isLocked}
                  className={`w-full bg-volcanic-400/60 border rounded-xl px-4 py-3 pr-10 text-cream text-sm placeholder:text-cream-muted/50 outline-none transition-colors ${
                    error ? 'border-lava/60 focus:border-lava' : 'border-white/10 focus:border-sunset/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && !isLocked && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-lava mt-1.5"
                >
                  Incorrect password. Please try again.
                  {failCount > 0 && failCount < MAX_ATTEMPTS && (
                    <span className="ml-1">({MAX_ATTEMPTS - failCount} attempts left)</span>
                  )}
                </motion.p>
              )}
              {isLocked && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-lava mt-1.5"
                >
                  Too many failed attempts. Try again in {lockCountdown}s.
                </motion.p>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !password || isLocked}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-sunset to-gold text-volcanic transition-all hover:shadow-glow-sunset disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-volcanic/40 border-t-volcanic rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-cream-muted mt-6">
          <a href="/" className="hover:text-cream transition-colors">← Back to main site</a>
        </p>
      </motion.div>
    </div>
  )
}
