'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Check, ArrowRight, ArrowLeft, User, Mail, Phone, MapPin, CreditCard, Calendar, Navigation, Phone as PhoneIcon, Sparkles } from 'lucide-react'
import { tourPackages } from '@/lib/data'
import { BookingCalendar } from '@/components/ui/calendar'
import { generateBookingCode } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
import { getPickupTimes } from '@/lib/pickup-times'

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

  const destinationName = params.get('destinationName') || ''
  const suggestSlug    = params.get('suggest') || ''
  const isDestMode     = !!params.get('destination') && !params.get('package')

  // Minimum booking date: H+2
  const minBookingDate = new Date()
  minBookingDate.setDate(minBookingDate.getDate() + 2)
  minBookingDate.setHours(0, 0, 0, 0)

  // Skip Step 1 if package already chosen OR coming from a destination page
  const [step, setStep] = useState(() =>
    (params.get('package') || params.get('destination')) ? 2 : 1
  )
  const [formData, setFormData] = useState({
    packageId: params.get('package') || '',
    date: params.get('date') || '',
    guests: parseInt(params.get('guests') || '2'),
    pickupTime: '',
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
  const [voucherInput, setVoucherInput] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherMsg, setVoucherMsg] = useState('')
  const [voucherLoading, setVoucherLoading] = useState(false)

  const selectedPkg    = tourPackages.find((p) => p.slug === formData.packageId)
  const suggestedPkg   = suggestSlug ? tourPackages.find((p) => p.slug === suggestSlug) : null
  const pickupTimeCfg  = getPickupTimes(formData.packageId || suggestSlug)
  const [dateError, setDateError] = useState('')

  // Auto-set default pickup time when package changes
  useEffect(() => {
    if (!formData.pickupTime && pickupTimeCfg.default) {
      setFormData(f => ({ ...f, pickupTime: pickupTimeCfg.default }))
    }
  }, [formData.packageId])
  const totalPriceUSD  = selectedPkg ? selectedPkg.price.usd * formData.guests : 0
  const pickupFeeUSD   = formData.pickupFee / 15000

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

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return
    setVoucherLoading(true); setVoucherMsg('')
    try {
      const res = await fetch('/api/bookings/voucher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherInput.trim(), total_usd: totalPriceUSD + pickupFeeUSD }),
      })
      const data = await res.json()
      if (data.valid) {
        setVoucherCode(data.code)
        setVoucherDiscount(data.discount_usd)
        setVoucherMsg(`✓ ${data.description} — saving ${formatPrice(data.discount_usd)}`)
      } else {
        setVoucherCode(''); setVoucherDiscount(0)
        setVoucherMsg(data.error || 'Kode tidak valid')
      }
    } finally { setVoucherLoading(false) }
  }

  const finalTotalUSD = Math.max(0, totalPriceUSD + pickupFeeUSD - voucherDiscount)

  const handleSubmit = async () => {
    // Save booking to Supabase
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code:          bookingCode,
          packageId:     formData.packageId || params.get('destination') || 'custom',
          packageTitle:  selectedPkg?.title || (destinationName ? `Trip to ${destinationName}` : 'Custom Trip'),
          date:          formData.date,
          guests:        formData.guests,
          pickupName:    formData.pickupName,
          pickupAddress: formData.pickupAddress,
          pickupTime:    formData.pickupTime,
          pickupFeeUsd:  pickupFeeUSD,
          pickupIsCustom: formData.pickupIsCustom,
          name:          formData.name,
          email:         formData.email,
          whatsapp:      formData.whatsapp,
          specialRequest: formData.specialRequest,
          paymentMethod: formData.paymentMethod,
          voucher_code:  voucherCode || null,
          discount_usd:  voucherDiscount || 0,
          totalUsd:      finalTotalUSD,
        }),
      })
      // Increment voucher usage if applied
      if (voucherCode) {
        fetch('/api/bookings/voucher/use', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: voucherCode }),
        }).catch(() => {})
      }
    } catch {
      // Continue even if DB save fails — show confirmation screen
    }
    setSubmitted(true)
  }

  if (submitted) {
    const waMessage = encodeURIComponent(
      `Halo Rehan Tour! Saya baru saja booking:\n\n` +
      `*Kode:* ${bookingCode}\n` +
      `*Paket:* ${selectedPkg?.title || '-'}\n` +
      `*Tanggal:* ${formData.date ? formatDateShort(formData.date) : '-'}\n` +
      `*Jam Jemput:* ${formData.pickupTime || '-'}\n` +
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
              {/* Header: show selected package OR destination name */}
              {selectedPkg ? (
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/8">
                  <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0">
                    <Image src={selectedPkg.coverImage} alt={selectedPkg.title} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{selectedPkg.title}</p>
                    <p className="text-xs text-cream-muted">{selectedPkg.duration}</p>
                  </div>
                </div>
              ) : isDestMode && destinationName ? (
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/8">
                  <div className="w-10 h-10 rounded-xl bg-sunset/15 border border-sunset/25 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-sunset" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">Trip to {destinationName}</p>
                    <p className="text-xs text-cream-muted">Custom visit · price confirmed via WhatsApp</p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-display text-lg text-cream mb-1">When?</h2>
                  <p className="text-xs text-cream-muted mb-4">Highlighted dates = next departures</p>
                  <BookingCalendar
                    onDateSelect={(d) => {
                      d.setHours(12, 0, 0, 0)
                      if (d < minBookingDate) {
                        setDateError('Minimum booking H+2 dari hari ini.')
                        return
                      }
                      setDateError('')
                      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                      setFormData({ ...formData, date: localDate })
                    }}
                    selectedDate={formData.date ? new Date(formData.date + 'T12:00:00') : null}
                    highlightedDates={tourPackages.map(p => p.nextDeparture)}
                  />
                  {dateError && <p className="text-xs text-lava mt-2">{dateError}</p>}
                  {formData.date && (() => {
                    const monthsAhead = (new Date(formData.date + 'T12:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
                    return monthsAhead > 6 ? (
                      <p className="text-xs text-gold mt-2 leading-relaxed">
                        📅 Booking jauh ke depan — harga & ketersediaan akan dikonfirmasi ulang H-7 sebelum keberangkatan.
                      </p>
                    ) : null
                  })()}
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

              {/* Pickup time picker */}
              <div className="mt-6 pt-6 border-t border-white/8">
                <h2 className="font-display text-lg text-cream mb-1">Jam Jemput</h2>
                <p className="text-xs text-cream-muted mb-3">
                  {pickupTimeCfg.note || 'Pilih waktu penjemputan yang sesuai'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {pickupTimeCfg.options.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, pickupTime: t })}
                      className={`py-2.5 rounded-xl text-sm font-mono font-medium border transition-all ${
                        formData.pickupTime === t
                          ? 'bg-sunset/20 border-sunset/50 text-sunset'
                          : 'border-white/10 text-cream-muted hover:border-sunset/30 hover:text-cream'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <input
                    type="time"
                    value={!pickupTimeCfg.options.includes(formData.pickupTime) ? formData.pickupTime : ''}
                    onChange={e => e.target.value && setFormData({ ...formData, pickupTime: e.target.value })}
                    className="py-2.5 px-2 rounded-xl text-sm font-mono border border-white/10 bg-volcanic-400/30 text-cream-muted hover:border-sunset/30 transition-all col-span-1"
                    title="Waktu lainnya"
                    placeholder="Lainnya"
                  />
                </div>
              </div>

              {/* Optional package upsell — destination mode only */}
              {isDestMode && suggestedPkg && (
                <div className="mt-6 pt-6 border-t border-white/8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <p className="text-sm font-medium text-cream">Want to add a guided experience?</p>
                    <span className="text-xs text-cream-muted ml-auto">Optional</span>
                  </div>
                  <div
                    onClick={() => setFormData({
                      ...formData,
                      packageId: formData.packageId === suggestedPkg.slug ? '' : suggestedPkg.slug,
                    })}
                    className={`flex gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                      formData.packageId === suggestedPkg.slug
                        ? 'border-gold/40 bg-gold/8'
                        : 'border-white/10 hover:border-gold/25'
                    }`}
                  >
                    <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0">
                      <Image src={suggestedPkg.coverImage} alt={suggestedPkg.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cream">{suggestedPkg.title}</p>
                      <p className="text-xs text-cream-muted mt-0.5">{suggestedPkg.duration} · +{formatPrice(suggestedPkg.price.usd)}/person</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${
                      formData.packageId === suggestedPkg.slug ? 'border-gold bg-gold' : 'border-white/25'
                    }`}>
                      {formData.packageId === suggestedPkg.slug && <Check className="w-3 h-3 text-volcanic" />}
                    </div>
                  </div>
                  <p className="text-xs text-cream-muted mt-2 text-center">
                    {formData.packageId ? 'Package added ✓ — uncheck to remove' : 'Skip this to book a standalone visit — we\'ll confirm details via WhatsApp'}
                  </p>
                </div>
              )}
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
                {selectedPkg ? (
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
                ) : isDestMode && destinationName ? (
                  <div className="flex gap-4 mb-5">
                    <div className="w-20 h-16 rounded-xl bg-sunset/10 border border-sunset/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-sunset" />
                    </div>
                    <div>
                      <p className="font-medium text-cream">Trip to {destinationName}</p>
                      <p className="text-xs text-cream-muted">{formData.guests} {t.booking.travelers_label} · Custom visit</p>
                      {formData.date && <p className="text-xs text-cream-muted">{formatDate(formData.date)}</p>}
                    </div>
                  </div>
                ) : null}
                <div className="space-y-3 text-sm">
                  {formData.pickupTime && (
                    <div className="flex justify-between text-cream-muted">
                      <span className="flex items-center gap-1.5">⏰ Jam Jemput</span>
                      <span className="text-cream font-mono font-medium">{formData.pickupTime} WIB</span>
                    </div>
                  )}
                  {selectedPkg && (
                    <div className="flex justify-between text-cream-muted">
                      <span>{formatPrice(selectedPkg.price.usd)} × {formData.guests} {t.booking.travelers_label}</span>
                      <span className="text-cream">{formatPrice(totalPriceUSD)}</span>
                    </div>
                  )}
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
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-jungle-light text-sm">
                      <span>Voucher ({voucherCode})</span>
                      <span>-{formatPrice(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-3 border-t border-white/8 text-base">
                    <span className="text-cream">{t.booking.total}</span>
                    {finalTotalUSD > 0 ? (
                      <span className="text-sunset text-xl font-bold font-display">{formatPrice(finalTotalUSD)}</span>
                    ) : (
                      <span className="text-gold text-sm font-medium">To be confirmed via WhatsApp</span>
                    )}
                  </div>

                  {/* Voucher input */}
                  <div className="pt-3 border-t border-white/8">
                    <p className="text-xs text-cream-muted mb-2">Promo Code</p>
                    <div className="flex gap-2">
                      <input
                        value={voucherInput}
                        onChange={e => { setVoucherInput(e.target.value); setVoucherMsg('') }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                        placeholder="Enter promo code"
                        className="input-dark flex-1 text-sm"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !voucherInput.trim()}
                        className="px-4 py-2 rounded-xl border border-sunset/40 text-sunset text-sm hover:bg-sunset/10 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {voucherLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {voucherMsg && (
                      <p className={`text-xs mt-1.5 ${voucherMsg.startsWith('✓') ? 'text-jungle-light' : 'text-red-400'}`}>
                        {voucherMsg}
                      </p>
                    )}
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
