import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { tourPackages } from '@/lib/data'
import { PrintButton } from './print-button'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { code: string }
}): Promise<Metadata> {
  return {
    title: `Itinerary ${params.code} | Rehan Tour & Travel`,
    description: 'Lihat dan cetak itinerary perjalanan Anda bersama Rehan Tour & Travel.',
  }
}

interface Booking {
  code: string
  package_id: string
  package_title: string
  date: string | null
  pickup_time: string | null
  pickup_name: string | null
  pickup_address: string | null
  guests: number
  name: string
  email: string | null
  whatsapp: string | null
  special_request: string | null
  status: string
  driver_name: string | null
  total_usd: number | null
}

async function getBooking(code: string): Promise<Booking | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('code', code)
    .single()
  if (error || !data) return null
  return data as Booking
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ItineraryPage({
  params,
}: {
  params: { code: string }
}) {
  const booking = await getBooking(params.code)

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Tidak Ditemukan</h1>
          <p className="text-gray-500">
            Kode booking <strong>{params.code}</strong> tidak ditemukan dalam sistem kami.
          </p>
        </div>
      </div>
    )
  }

  // Find the matching tour package by id or slug
  const pkg = tourPackages.find(
    (p) =>
      p.id === booking.package_id ||
      p.slug === booking.package_id ||
      p.title.toLowerCase() === booking.package_id?.toLowerCase(),
  )

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://rehan-tour-travel-prototype.vercel.app'

  return (
    <>
      {/* ── Print styles injected inline so they work in any env ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .page-wrapper { padding: 0 !important; }
          .itinerary-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
        @page {
          size: A4;
          margin: 16mm 14mm;
        }
      `}</style>

      <div className="page-wrapper min-h-screen bg-stone-50 py-10 px-4 print:bg-white print:py-0 print:px-0">
        <div className="max-w-3xl mx-auto">

          {/* ── PRINT BUTTON ── */}
          <div className="no-print flex justify-end mb-6">
            <PrintButton />
          </div>

          {/* ── DOCUMENT ── */}
          <div className="itinerary-card bg-white shadow-lg rounded-2xl overflow-hidden print:rounded-none print:shadow-none">

            {/* ── HEADER ── */}
            <div className="bg-stone-900 text-white px-8 py-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-1">
                  Travel Itinerary
                </p>
                <h1 className="text-2xl font-bold tracking-tight leading-tight">
                  REHAN TOUR & TRAVEL
                </h1>
                <p className="text-sm text-stone-300 mt-1">
                  East Java &amp; Bali Specialist
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">
                  Kode Booking
                </p>
                <p className="font-mono text-xl font-bold text-amber-400 tracking-wider">
                  {booking.code}
                </p>
              </div>
            </div>

            {/* ── BOOKING SUMMARY ── */}
            <div className="px-8 py-6 border-b border-stone-100">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
                Ringkasan Booking
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                <SummaryRow label="Paket" value={booking.package_title} />
                <SummaryRow label="Tanggal" value={formatDate(booking.date)} />
                <SummaryRow label="Jumlah Tamu" value={`${booking.guests} orang`} />
                <SummaryRow
                  label="Jam Jemput"
                  value={booking.pickup_time ? `${booking.pickup_time} WIB` : 'Akan dikonfirmasi'}
                />
                <SummaryRow
                  label="Lokasi Pickup"
                  value={booking.pickup_name || '—'}
                  wide
                />
                {booking.driver_name && (
                  <SummaryRow label="Driver" value={booking.driver_name} />
                )}
                {booking.total_usd && booking.total_usd > 0 ? (
                  <SummaryRow label="Total" value={`$${booking.total_usd}`} />
                ) : null}
                <SummaryRow
                  label="Status"
                  value={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                />
              </div>
              {booking.special_request && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-700 mb-0.5">
                    Permintaan Khusus
                  </p>
                  <p className="text-sm text-amber-900">{booking.special_request}</p>
                </div>
              )}
            </div>

            {/* ── ITINERARY PER DAY ── */}
            <div className="px-8 py-6 border-b border-stone-100">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">
                Itinerary Hari per Hari
              </h2>

              {pkg?.itinerary && pkg.itinerary.length > 0 ? (
                <div className="space-y-6">
                  {pkg.itinerary.map((day) => (
                    <div key={day.day} className="flex gap-4">
                      {/* Day badge */}
                      <div className="shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold leading-none">
                          <span className="flex flex-col items-center">
                            <span className="text-[9px] text-stone-400 leading-none">DAY</span>
                            <span className="text-sm font-bold leading-none">{day.day}</span>
                          </span>
                        </div>
                        {/* Vertical connector */}
                        <div className="w-px bg-stone-200 mx-auto mt-1" style={{ height: 'calc(100% - 2.75rem)', minHeight: '16px' }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <h3 className="font-semibold text-stone-900 text-sm leading-snug mb-1">
                          {day.title}
                        </h3>
                        <p className="text-sm text-stone-500 leading-relaxed mb-3">
                          {day.description}
                        </p>

                        {/* Activities */}
                        {day.activities.length > 0 && (
                          <ul className="space-y-1 mb-3">
                            {day.activities.map((act, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                {act}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Meals + accommodation badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {day.meals.map((m, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200"
                            >
                              🍽️ {m}
                            </span>
                          ))}
                          {day.accommodation && day.accommodation !== 'None (return)' && day.accommodation !== 'None (end of programme)' && day.accommodation !== 'Departure' && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              🏨 {day.accommodation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback: no detailed itinerary in static data */
                <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                  <p className="text-sm font-medium text-stone-700 mb-2">
                    {booking.package_title}
                  </p>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Detail itinerary untuk paket ini akan dikonfirmasi oleh tim Rehan Tour & Travel
                    via WhatsApp sebelum keberangkatan. Pastikan nomor WhatsApp Anda aktif.
                  </p>
                  {pkg && (
                    <div className="mt-4 space-y-2">
                      {pkg.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── TRAVEL TIPS ── */}
            <div className="px-8 py-6 border-b border-stone-100">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
                Tips Perjalanan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    icon: '🧥',
                    tip: 'Bawa jaket tebal',
                    detail: 'Suhu gunung bisa 5–10°C di pagi hari',
                  },
                  {
                    icon: '👟',
                    tip: 'Sepatu tertutup',
                    detail: 'Wajib untuk trekking; hindari sandal',
                  },
                  {
                    icon: '🔋',
                    tip: 'Charge HP penuh',
                    detail: 'Bawa powerbank untuk hari panjang',
                  },
                  {
                    icon: '🍽️',
                    tip: 'Sarapan sebelum berangkat',
                    detail: 'Sebelum jam jemput — jangan perut kosong',
                  },
                ].map(({ icon, tip, detail }) => (
                  <div
                    key={tip}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                  >
                    <span className="text-xl leading-none">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{tip}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── WHAT'S INCLUDED / EXCLUDED ── */}
            {pkg && (
              <div className="px-8 py-6 border-b border-stone-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                      Sudah Termasuk
                    </h2>
                    <ul className="space-y-1.5">
                      {pkg.included.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                          <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                      Tidak Termasuk
                    </h2>
                    <ul className="space-y-1.5">
                      {pkg.excluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-500">
                          <span className="text-stone-400 mt-0.5 shrink-0">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── EMERGENCY CONTACT ── */}
            <div className="px-8 py-6 border-b border-stone-100 bg-stone-50 print:bg-white">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
                Kontak Darurat
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                <a
                  href="https://wa.me/6281234567890"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors no-print"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.523 5.837L.057 23.714a.75.75 0 0 0 .93.93l5.877-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.87 0-3.632-.48-5.165-1.323l-.371-.21-3.875.968.984-3.79-.23-.386A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  WhatsApp Admin
                </a>
                <div className="text-sm">
                  <p className="font-semibold text-stone-800">Rehan Tour & Travel</p>
                  <p className="text-stone-500">+62 812-3456-7890</p>
                </div>
              </div>
              {/* Print-only contact */}
              <p className="hidden print:block text-sm text-stone-700 mt-2">
                WhatsApp / Telp: <strong>+62 812-3456-7890</strong>
              </p>
            </div>

            {/* ── TRACK LINK ── */}
            <div className="px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Track booking live:</p>
                <p className="text-sm font-mono text-stone-700">
                  {baseUrl}/booking/{booking.code}
                </p>
              </div>
              <a
                href={`${baseUrl}/booking/${booking.code}`}
                className="no-print text-sm font-medium text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                Buka Tracker →
              </a>
            </div>

            {/* ── FOOTER ── */}
            <div className="bg-stone-900 text-stone-400 px-8 py-4 text-xs flex items-center justify-between flex-wrap gap-2">
              <span>© Rehan Tour & Travel · rehan-tour-travel-prototype.vercel.app</span>
              <span>Dicetak pada {new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>

          {/* ── BOTTOM PRINT BUTTON ── */}
          <div className="no-print flex justify-center mt-8 mb-12">
            <PrintButton />
          </div>
        </div>
      </div>
    </>
  )
}

// ── Small helper component ─────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div className={wide ? 'col-span-2 sm:col-span-full' : ''}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-stone-800">{value}</p>
    </div>
  )
}
