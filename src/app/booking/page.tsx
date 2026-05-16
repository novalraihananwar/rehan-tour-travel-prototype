'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight, ArrowLeft, User, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react'
import { tourPackages, pickupPoints } from '@/lib/data'
import { BookingCalendar } from '@/components/ui/calendar'
import { generateBookingCode } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'

function BookingPageInner() {
  const params = useSearchParams()
  const { t, lang, formatPrice, formatPriceCompact, currency } = useLanguage()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    packageId: params.get('package') || '',
    date: params.get('date') || '',
    guests: parseInt(params.get('guests') || '2'),
    pickupId: '',
    name: '',
    email: '',
    whatsapp: '',
    specialRequest: '',
    paymentMethod: 'bank-transfer',
  })
  const [submitted, setSubmitted] = useState(false)
  const [bookingCode] = useState(generateBookingCode())

  const selectedPkg = tourPackages.find((p) => p.slug === formData.packageId)
  const selectedPickup = pickupPoints.find((p) => p.id === formData.pickupId)

  const totalPriceUSD = selectedPkg ? selectedPkg.price.usd * formData.guests : 0
  const pickupFeeUSD = selectedPickup ? selectedPickup.additionalFee / 15000 : 0

  const steps = [
    { id: 1, label: t.booking.step1, icon: Calendar },
    { id: 2, label: t.booking.step2, icon: MapPin },
    { id: 3, label: t.booking.step3, icon: User },
    { id: 4, label: t.booking.step4, icon: CreditCard },
  ]

  const paymentMethods = [
    { id: 'bank-transfer', label: t.payment.bankTransfer, icon: '🏦' },
    { id: 'qris', label: t.payment.qris, icon: '📱' },
    { id: 'paypal', label: t.payment.paypal, icon: '💳' },
    { id: 'xendit', label: t.payment.xendit, icon: '⚡' },
  ]

  // Fix: use T12:00:00 so the date string is treated as local time, not UTC
  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString(currency.locale, {
      weekday: 'long', month: 'long', day: 'numeric',
    })

  const formatDateShort = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString(currency.locale, {
      weekday: 'short', month: 'long', day: 'numeric',
    })

  const handleNext = () => step < 4 && setStep(step + 1)
  const handleBack = () => step > 1 && setStep(step - 1)
  const handleSubmit = () => setSubmitted(true)

  if (submitted) {
    return (
      <div className="min-h-screen bg-volcanic flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-jungle/20 border-2 border-jungle flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-jungle-light" />
          </div>
          <h1 className="font-display text-3xl text-cream mb-2">{t.booking.confirmed}</h1>
          <p className="text-cream-muted mb-6">{t.booking.confirmedSub}</p>

          <div className="bg-volcanic-400/50 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="text-center">
              <p className="text-xs text-cream-muted">{t.booking.bookingCode}</p>
              <p className="font-mono text-2xl text-sunset font-bold tracking-wider">{bookingCode}</p>
            </div>
            <div className="section-divider" />
            {selectedPkg && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-cream-muted">Package</span>
                  <span className="text-cream font-medium">{selectedPkg.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cream-muted">{t.booking.travelers}</span>
                  <span className="text-cream">{formData.guests} {t.booking.travelers_label}</span>
                </div>
                {formData.date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-cream-muted">{t.booking.departure}</span>
                    <span className="text-cream">{formatDateShort(formData.date)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-cream-muted">{t.booking.total}</span>
                  <span className="text-sunset">{formatPrice(totalPriceUSD + pickupFeeUSD)}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-cream-muted mb-6">
            {t.booking.whatsappConfirm} <span className="text-cream">{formData.whatsapp}</span>
          </p>

          <div className="flex gap-3">
            <Link href="/" className="btn-ghost flex-1 justify-center text-sm py-3">{t.booking.backHome}</Link>
            <Link href="/packages" className="btn-primary flex-1 justify-center text-sm py-3">{t.booking.morePackages}</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-volcanic pt-20">
      {/* Hero */}
      <div className="relative py-16 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=60" alt="Booking" fill className="object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-volcanic/60 to-volcanic" />
        <div className="relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-display-md text-cream">
            <span className="text-gradient-sunset">{t.booking.title}</span>
          </motion.h1>
          <p className="text-cream-muted mt-2">{t.booking.subtitle}</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                step === s.id ? 'bg-gradient-to-r from-sunset to-gold text-volcanic' :
                step > s.id ? 'bg-jungle/20 text-jungle-light border border-jungle/25' :
                'bg-volcanic-400/50 text-cream-muted border border-white/8'
              }`}>
                {step > s.id ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-6 h-px ${step > s.id ? 'bg-jungle/40' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl text-cream mb-6">{t.booking.step1}</h2>

              {/* Package selector */}
              <div className="mb-6">
                <label className="text-xs text-cream-muted uppercase tracking-wider block mb-3">{t.booking.selectPackage}</label>
                <div className="grid grid-cols-1 gap-3">
                  {tourPackages.slice(0, 5).map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setFormData({ ...formData, packageId: pkg.slug })}
                      className={`flex gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-200 ${formData.packageId === pkg.slug ? 'border-sunset/50 bg-sunset/8' : 'border-white/8 hover:border-sunset/25 bg-volcanic-400/30'}`}
                    >
                      <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0">
                        <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-cream">{pkg.title}</p>
                        <p className="text-xs text-cream-muted mt-0.5">{pkg.duration} · {formatPrice(pkg.price.usd)}{t.booking.perPerson}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${formData.packageId === pkg.slug ? 'border-sunset bg-sunset' : 'border-white/25'}`}>
                        {formData.packageId === pkg.slug && <Check className="w-3 h-3 text-volcanic" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date & Guests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-3">{t.booking.departureDate}</label>
                  <BookingCalendar
                    onDateSelect={(d) => {
                      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                      setFormData({ ...formData, date: localDate })
                    }}
                    selectedDate={formData.date ? new Date(formData.date + 'T12:00:00') : null}
                    highlightedDates={tourPackages.map(p => p.nextDeparture)}
                  />
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-3">{t.booking.travelers}</label>
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })} className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-cream text-xl">−</button>
                      <span className="text-3xl font-bold text-cream font-display flex-1 text-center">{formData.guests}</span>
                      <button onClick={() => setFormData({ ...formData, guests: Math.min(15, formData.guests + 1) })} className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-cream text-xl">+</button>
                    </div>
                    {selectedPkg && (
                      <p className="text-center text-xs text-cream-muted mt-3">
                        {t.booking.totalEstimate}: <span className="text-sunset font-medium">{formatPrice(selectedPkg.price.usd * formData.guests)}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl text-cream mb-6">{t.booking.pickupPoint}</h2>

              {(['surabaya', 'malang', 'banyuwangi', 'bali'] as const).map((region) => {
                const regionPoints = pickupPoints.filter((p) => p.region === region)
                const regionLabels: Record<string, string> = { surabaya: '🏙️ Surabaya', malang: '🏔️ Malang', banyuwangi: '⛴️ Banyuwangi', bali: '🏝️ Bali' }
                return (
                  <div key={region} className="mb-6">
                    <p className="text-xs text-cream-muted uppercase tracking-widest mb-3">{regionLabels[region]}</p>
                    <div className="space-y-2">
                      {regionPoints.map((point) => (
                        <div
                          key={point.id}
                          onClick={() => setFormData({ ...formData, pickupId: point.id })}
                          className={`flex items-center gap-4 p-3.5 rounded-xl cursor-pointer border transition-all ${formData.pickupId === point.id ? 'border-sunset/50 bg-sunset/8' : 'border-white/8 hover:border-white/15'}`}
                        >
                          <MapPin className="w-4 h-4 text-cream-muted shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-cream font-medium">{point.name}</p>
                            <p className="text-xs text-cream-muted">{point.landmark}</p>
                          </div>
                          {point.additionalFee > 0 && (
                            <span className="text-xs text-gold">+{formatPriceCompact(point.additionalFee / 15000)}</span>
                          )}
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${formData.pickupId === point.id ? 'border-sunset bg-sunset' : 'border-white/25'}`}>
                            {formData.pickupId === point.id && <div className="w-1.5 h-1.5 rounded-full bg-volcanic" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl text-cream mb-6">{t.booking.step3}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">{t.booking.fullName} *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-dark pl-10" placeholder={t.booking.namePlaceholder} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">{t.booking.email} *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-dark pl-10" placeholder={t.booking.emailPlaceholder} type="email" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">{t.booking.whatsapp} *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
                    <input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="input-dark pl-10" placeholder={t.booking.whatsappPlaceholder} />
                  </div>
                  <p className="text-xs text-cream-muted mt-1.5">{t.booking.whatsappNote}</p>
                </div>
                <div>
                  <label className="text-xs text-cream-muted uppercase tracking-wider block mb-2">{t.booking.specialRequest}</label>
                  <textarea value={formData.specialRequest} onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })} className="input-dark h-24 resize-none" placeholder={t.booking.specialRequestPlaceholder} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              {/* Order summary */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl text-cream mb-5">{t.booking.orderSummary}</h2>
                {selectedPkg && (
                  <div className="flex gap-4 mb-5">
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
                      <Image src={selectedPkg.coverImage} alt={selectedPkg.title} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-cream">{selectedPkg.title}</p>
                      <p className="text-xs text-cream-muted">{selectedPkg.duration} · {formData.guests} {t.booking.travelers_label}</p>
                      {formData.date && <p className="text-xs text-cream-muted">{formatDate(formData.date)}</p>}
                    </div>
                  </div>
                )}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-cream-muted">
                    <span>{formatPrice(selectedPkg?.price.usd ?? 0)} × {formData.guests} {t.booking.travelers_label}</span>
                    <span className="text-cream">{formatPrice(totalPriceUSD)}</span>
                  </div>
                  {pickupFeeUSD > 0 && (
                    <div className="flex justify-between text-cream-muted">
                      <span>{selectedPickup?.name}</span>
                      <span className="text-cream">+{formatPrice(pickupFeeUSD)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-3 border-t border-white/8 text-base">
                    <span className="text-cream">{t.booking.total}</span>
                    <span className="text-sunset text-xl font-bold font-display">{formatPrice(totalPriceUSD + pickupFeeUSD)}</span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-medium text-cream mb-4">{t.booking.paymentMethod}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${formData.paymentMethod === m.id ? 'border-sunset/50 bg-sunset/8' : 'border-white/8 hover:border-white/15'}`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-sm text-cream">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={handleBack} className="btn-ghost flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> {t.booking.back}
            </button>
          )}
          <button
            onClick={step === 4 ? handleSubmit : handleNext}
            className="btn-primary flex-1 justify-center"
          >
            {step === 4 ? t.booking.confirmPay : t.booking.continue}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-xs text-cream-muted mt-4">{t.booking.freeCancel}</p>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-volcanic flex items-center justify-center"><div className="text-cream-muted">Loading...</div></div>}>
      <BookingPageInner />
    </Suspense>
  )
}
