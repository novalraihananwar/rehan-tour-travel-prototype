'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'

const quickMessages = [
  '👋 I want to book a Bromo Sunrise tour',
  '🌋 Tell me about the Ijen Crater expedition',
  '🚐 What pickup points are available from Surabaya?',
  '🏝️ I need help planning a Bali trip',
  '💰 What is the price for the overland tour?',
]

export function FloatingWhatsApp() {
  const [open, setOpen] = useState(false)
  const [showPulse, setShowPulse] = useState(true)

  const waNumber = '6281234567890'
  const baseUrl = `https://wa.me/${waNumber}`

  const openWhatsApp = (message?: string) => {
    const url = message
      ? `${baseUrl}?text=${encodeURIComponent(message)}`
      : baseUrl
    window.open(url, '_blank')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl w-80 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#25D366]/20 to-[#128C7E]/20 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <p className="font-medium text-cream text-sm">Rehan Tour & Travel</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#25D366]" />
                    <span className="text-xs text-cream-muted">Online now · Fast reply</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat preview */}
            <div className="p-4 space-y-2">
              <div className="bg-volcanic-400/60 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-sm text-cream">
                  👋 Hi! Ready to plan your East Java or Bali adventure? Ask us anything!
                </p>
                <p className="text-xs text-cream-muted mt-1">Just now</p>
              </div>

              <p className="text-xs text-cream-muted text-center py-1">Quick messages:</p>

              <div className="space-y-1.5">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => openWhatsApp(msg)}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-white/4 hover:bg-[#25D366]/15 hover:text-[#25D366] text-cream-dark border border-white/8 hover:border-[#25D366]/25 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span>{msg}</span>
                    <Send className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Direct open button */}
            <div className="p-3 pt-0">
              <button
                onClick={() => openWhatsApp()}
                className="w-full py-3 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 bg-wa-gradient"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Open WhatsApp Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <div className="relative">
        {showPulse && !open && (
          <>
            <div className="absolute inset-0 rounded-full bg-wa animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full bg-wa animate-pulse opacity-20 scale-125" />
          </>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setOpen(!open); setShowPulse(false) }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 bg-wa-gradient"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="w-6 h-6 text-white fill-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
