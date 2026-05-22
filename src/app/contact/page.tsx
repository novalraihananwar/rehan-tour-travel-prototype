'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const faqs = [
  { q: 'How do I book a tour?', a: 'You can book directly through our website — go to any package page and click "Book Now". No account required. You\'ll receive a WhatsApp confirmation within 30 minutes.' },
  { q: 'What payment methods do you accept?', a: 'We accept bank transfer (BCA, Mandiri, BRI), QRIS, PayPal, and Xendit. A 30% deposit is required to confirm your booking, with the balance due 3 days before departure.' },
  { q: 'Can I cancel or reschedule my booking?', a: 'Free cancellation up to 72 hours before departure. 50% refund for cancellations 24-72 hours before. No refund for cancellations within 24 hours. Rescheduling is free if done 48+ hours in advance.' },
  { q: 'What are the pickup locations?', a: 'We pick up from hotels, airports, and major landmarks in Surabaya, Malang, Banyuwangi, and Bali. Custom pickup points can be arranged for small additional fee.' },
  { q: 'What vehicles do you use?', a: 'We use Toyota HiAce premium minivans (12-seat) for group tours and Toyota HiAce Grande (6-seat) for private tours. All vehicles are air-conditioned with comfortable seats and are maintained weekly.' },
  { q: 'What is included in the tour price?', a: 'Transportation throughout the tour, experienced English-speaking guide, entrance fees to major attractions listed in the itinerary, and hotel pickup/drop-off. Accommodation and meals are usually not included unless stated.' },
  { q: 'Can I arrange a private tour?', a: 'Yes! We offer fully private tours for individuals, couples, families, and corporate groups. Contact us directly via WhatsApp for custom pricing and itinerary planning.' },
  { q: 'What should I bring?', a: 'Comfortable walking shoes, light jacket (Bromo and Ijen can be cold at 2-3°C at night), sun protection, camera, and cash in IDR for personal expenses. We recommend downloading offline maps and a translation app.' },
  { q: 'Is it safe to travel to these destinations?', a: 'Yes. East Java and Bali are among Indonesia\'s safest regions for tourists. We monitor volcanic activity (Bromo and Ijen) and will reschedule trips if conditions are unsafe. Our guides are trained in first aid.' },
  { q: 'Do you cater to vegetarians or dietary restrictions?', a: 'Absolutely. Let us know when booking and we\'ll arrange appropriate meals at stops. East Java and Bali have excellent options for all dietary needs.' },
]

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' })

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi Rehan Tour!\n\nName: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`)
    window.open(`https://wa.me/6281234567890?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-volcanic pt-20">
      {/* Hero */}
      <section className="py-24 border-b border-white/6">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-xs text-sunset tracking-widest uppercase mb-3">We&apos;re Here to Help</p>
            <h1 className="font-display text-5xl sm:text-6xl text-cream mb-6">Get In Touch</h1>
            <p className="text-cream-muted text-lg max-w-2xl">Have questions about our tours? Want to plan a custom trip? We respond to all WhatsApp messages within 1 hour, and emails within 24 hours.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact info + form */}
          <div className="space-y-8">
            {/* Contact cards */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
              {[
                { icon: Phone, label: 'WhatsApp (fastest)', value: '+62 812-3456-7890', href: 'https://wa.me/6281234567890', color: 'text-jungle-light' },
                { icon: Mail, label: 'Email', value: 'info@rehantour.id', href: 'mailto:info@rehantour.id', color: 'text-sunset' },
                { icon: MapPin, label: 'Office', value: 'Jl. Raya Bromo No.1, Surabaya, East Java 60271', href: null, color: 'text-gold' },
              ].map(c => (
                <div key={c.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-volcanic-400 flex items-center justify-center shrink-0`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cream-muted mb-0.5">{c.label}</p>
                    <p className="text-sm text-cream font-medium">{c.value}</p>
                  </div>
                  {c.href && (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-cream-muted hover:text-cream transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Response times */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs text-cream-muted uppercase tracking-wider mb-3">Response Times</p>
              <div className="space-y-2">
                {[
                  { channel: 'WhatsApp', time: '< 1 hour', color: 'text-jungle-light' },
                  { channel: 'Email', time: '< 24 hours', color: 'text-sunset' },
                  { channel: 'Operating hours', time: '07:00 – 22:00 WIB (GMT+7)', color: 'text-gold' },
                ].map(r => (
                  <div key={r.channel} className="flex items-center justify-between">
                    <span className="text-sm text-cream-muted">{r.channel}</span>
                    <span className={`text-xs font-medium ${r.color}`}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl text-cream">Send a Message</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-dark w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="input-dark w-full text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-dark w-full text-sm appearance-none">
                  <option>General Inquiry</option>
                  <option>Booking Question</option>
                  <option>Custom Tour Request</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-cream-muted uppercase tracking-wider block mb-1.5">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Tell us how we can help..." className="input-dark w-full text-sm resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleWhatsApp} className="btn-primary flex items-center gap-2 flex-1 justify-center py-3 text-sm">
                  <MessageCircle className="w-4 h-4" /> Send via WhatsApp
                </button>
                <a href={`mailto:info@rehantour.id?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\n\n${form.message}`)}`}
                  className="btn-ghost flex items-center gap-2 px-5 py-3 text-sm">
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            </motion.div>
          </div>

          {/* FAQ */}
          <div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-xs text-gold tracking-widest uppercase mb-3">FAQ</p>
              <h2 className="font-display text-3xl text-cream mb-8">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                    className="glass-card rounded-2xl overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors">
                      <span className="text-sm font-medium text-cream pr-4">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="w-4 h-4 text-sunset shrink-0" /> : <ChevronDown className="w-4 h-4 text-cream-muted shrink-0" />}
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <p className="px-5 pb-5 text-sm text-cream-muted leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
