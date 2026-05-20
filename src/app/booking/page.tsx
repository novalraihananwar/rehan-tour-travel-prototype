'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Check, ArrowRight, ArrowLeft, User, Mail, Phone, MapPin, CreditCard, Calendar, Navigation, Phone as PhoneIcon } from 'lucide-react'
import { tourPackages } from '@/lib/data'
import { BookingCalendar } from '@/components/ui/calendar'
import { generateBookingCode } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'

const PickupMap = dynamic(() => import('@/components/ui/pickup-map').then(m => m.PickupMap), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] rounded-2xl bg-volcanic-200 border border-white/8 flex items-center justify-center">
      <span className="text-cream-muted text-sm">Loading map...</span>
    </div>
  ),
})

function BookingPageInner() {
  const params = useSearchParams()
  const { t, lang, formatPrice, formatPriceCompact, currency } = useLanguage()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    packageId: params.get('package') || '',
    date: params.get('date') || '',
    guests: parseInt(params.get('guests') || '2'),
    pickupId: '',
    pickupName: '',
    pickupAddress: '',
    pickupFee: 0,
    pickupIsCustom: false,
    name: '',
    email: '',
    whatsapp: '',
    specialRequest: '',
    paymentMethod: 'bank-transfer',
  })
  const [submitted, setSubmitted] = useState(false)
  const [bookingCode] = useState(generateBookingCode())

  const selectedPkg = tourPackages.find((p) => p.slug === formData.packageId)
  const totalPriceUSD = selectedPkg ? selectedPkg.price.usd * formData.guests : 0
  const pickupFeeUSD = formData.pickupFee / 15000

  const TOTAL_STEPS = 5
  const steps = [
    { id: 1, label: 'Package', icon: Calendar },
    { id: 2, label: 'Date & Guests', icon: Calendar },
    { id: 3, label: 'Pickup', icon: MapPin },
    { id: 4, label: 'Details', icon: User },
    { id: 5, label: 'Payment', icon: CreditCard },
  ]

  const paymentMethods = [
    { id: 'bank-transfer', label: t.payment.bankTransfer, icon: 'Bank' },
    { id: 'qris', label: t.payment.qris, icon: 'QRIS' },
    { id: 'paypal', label: t.payment.paypal, icon: 'PayPal' },
    { id: 'xendit', label: t.payment.xendit, icon: 'Xendit' },
  ]

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString(currency.locale, {
      weekday: 'long', month: 'long', day: 'numeric',
    })

  const formatDateShort = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString(currency.locale, {
      weekday: 'short', month: 'long', day: 'numeric',
    })

  const handleNext = () => step < TOTAL_STEPS && setStep(step + 1)
  const handleBack = () => step > 1 && setStep(step - 1)
  const handleSubmit = () => setSubmitted(true)

  if (submitted) {
    const waMessage = encodeURIComponent(
      `Halo Rehan Tour! Saya baru saja booking:\n\n` +
      `*Kode:* ${bookingCode}\n` +
      `*Paket:* ${selectedPkg?.title || '-'}\n` +
      `*Tanggal:* ${formData.date ? formatDateShort(formData.date) : '-'}\n` +
      `*Tamu:* ${formData.guests} orang\n` +
      `*Pickup:* ${formData.pickupName || '-'}\n` +
      `*Total:* ${formatPrice(totalPriceUSD + pickupFeeUSD)}\n\n` +
      `Mohon konfirmasi booking saya. Terima kasih!`
    )
    const waLink = `https://wa.me/6281234567890?text=${waMessage}`

    return (
      <div className="min-h-screen bg-volcanic flex items-center justify-center pt-20 px-4 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-8 max-w-lg w-full">

          {/* Success icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-jungle/20 border-2 border-jungle flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-jungle-light" />
            </div>
            <h1 className="font-display text-3xl text-cream mb-1">Booking confirmed!</h1>
            <p className="text-cream-muted text-sm">We&apos;ll contact you via WhatsApp shortly.</p>
          </div>

          {/* Booking code — prominent */}
          <div className="bg-volcanic-400/50 rounded-2xl p-5 mb-5 text-center border border-sunset/15">
            <p className="text-xs text-cream-muted mb-1">Your booking code</p>
            <p className="font-mono text-3xl text-sunset font-bold tracking-widest">{bookingCode}</p>
            <p className="text-xs text-cream-muted mt-1">Save this to track your trip</p>
          </div>

          {/* Trip summary */}
          {selectedPkg && (
            <div className="space-y-2.5 text-sm mb-5">
              {[
                { label: 'Package', value: selectedPkg.title },
                { label: 'Travelers', value: `${formData.guests} person${formData.guests > 1 ? 's' : ''}` },
                ...(formData.date ? [{ label: 'Departure', value: formatDateShort(formData.date) }] : []),
                ...(formData.pickupName ? [{ label: 'Pickup', value: formData.pickupName }] : []),
                { label: 'Total', value: formatPrice(totalPriceUSD + pickupFeeUSD), highlight: true },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-cream-muted">{item.label}</span>
                  <span className={(item as { highlight?: boolean }).highlight ? 'text-sunset font-bold font-display text-base' : 'text-cream font-medium'}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-3">
            {/* Track booking */}
            <Link
              href={`/booking/${bookingCode}`}
              className="btn-primary w-full justify-center py-3.5"
            >
              <Navigation className="w-4 h-4" />
              Track my booking
            </Link>

            {/* WA confirmation */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-medium text-sm text-white transition-all duration-300 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <Phone className="w-4 h-4" />
              Confirm via WhatsApp
            </a>

            <div className="flex gap-3">
              <Link href="/" className="btn-ghost flex-1 justify-center text-sm py-2.5">Home</Link>
              <Link href="/packages" className="btn-ghost flex-1 justify-center text-sm py-2.5">More packages</Link>
            </div>
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
        {/* Progress bar */}
        <div className="w-full bg-volcanic-400 rounded-full h-1 mb-4">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-sunset to-gold transition-all duration-500"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step === s.id ? 'bg-gradient-to-r from-sunset to-gold text-volcanic' :
                step > s.id ? 'bg-jungle/25 text-jungle-light border border-jungle/30' :
                'bg-volcanic-400/50 text-cream-muted border border-white/8'
              }`}>
                {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-xs hidden sm:block transition-colors ${step === s.id ? 'text-cream' : 'text-cream-muted'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {/* Step 1 — Choose package */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl text-cream mb-2">Which trip?</h2>
              <p className="text-sm text-cream-muted mb-6">Select the package you want to book.</p>
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cream">{pkg.title}</p>
                      <p className="text-xs text-cream-muted mt-0.5">{pkg.duration} · from {formatPrice(pkg.price.usd)} / person</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${formData.packageId === pkg.slug ? 'border-sunset bg-sunset' : 'border-white/25'}`}>
                      {formData.packageId === pkg.slug && <Check className="w-3 h-3 text-volcanic" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Date & Guests */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-6 md:p-8">
              {selectedPkg && (
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/8">
                  <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0">
                    <Image src={selectedPkg.coverImage} alt={selectedPkg.title} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{selectedPkg.title}</p>
                    <p className="text-xs text-cream-muted">{selectedPkg.duration}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-display text-lg text-cream mb-1">When?</h2>
                  <p className="text-xs text-cream-muted mb-4">Highlighted dates = next departures</p>
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
                  <h2 className="font-display text-lg text-cream mb-1">How many?</h2>
                  <p className="text-xs text-cream-muted mb-4">Number of travelers</p>
                  <div className="glass-card rounded-2xl p-6 text-center">
                    <div className="flex items-center justify-center gap-6">
                      <button onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })} className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-cream text-2xl hover:border-sunset/40 transition-colors">−</button>
                      <span className="text-5xl font-bold text-cream font-display w-12">{formData.guests}</span>
                      <button onClick={() => setFormData({ ...formData, guests: Math.min(15, formData.guests + 1) })} className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-cream text-2xl hover:border-sunset/40 transition-colors">+</button>
                    </div>
                    <p className="text-xs text-cream-muted mt-4">Max {selectedPkg?.maxGroupSize || 15} per group</p>
                    {selectedPkg && (
                      <div className="mt-4 pt-4 border-t border-white/8">
                        <p className="text-xs text-cream-muted">Estimated total</p>
                        <p className="text-xl font-bold text-gradient-sunset font-display mt-1">{formatPrice(selectedPkg.price.usd * formData.guests)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Pickup */}
          {step === 3 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="font-display text-xl text-cream mb-1">{t.booking.pickupPoint}</h2>
                <p className="text-sm text-cream-muted">
                  Choose a preset pickup point or drop a pin anywhere across East Java and Bali.
                </p>
              </div>

              <PickupMap
                selectedId={formData.pickupId}
                onSelect={(location) => {
                  setFormData({
                    ...formData,
                    pickupId: location.id,
                    pickupName: location.name,
                    pickupAddress: location.address,
                    pickupFee: location.additionalFee,
                    pickupIsCustom: location.isCustom || false,
                  })
                }}
              />

              {formData.pickupIsCustom && (
                <div className="mt-4 p-3 rounded-xl border border-gold/25 bg-gold/5">
                  <p className="text-xs text-gold">
                    Custom pin selected. Our driver will confirm the exact meeting point via WhatsApp before departure.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4 — Details */}
          {step === 4 && (
            <motion.div key="step4d" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl text-cream mb-2">Your details</h2>
              <p className="text-sm text-cream-muted mb-6">We&apos;ll send your confirmation to these contacts.</p>
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

          {/* Step 5 — Review + Payment */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
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
                  {formData.pickupName && (
                    <div className="flex justify-between text-cream-muted">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-3 h-3" />
                        {formData.pickupName}
                      </span>
                      <span className="text-cream">
                        {pickupFeeUSD > 0 ? `+${formatPrice(pickupFeeUSD)}` : 'Included'}
                      </span>
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
            onClick={step === TOTAL_STEPS ? handleSubmit : handleNext}
            className="btn-primary flex-1 justify-center"
          >
            {step === TOTAL_STEPS ? t.booking.confirmPay : t.booking.continue}
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
