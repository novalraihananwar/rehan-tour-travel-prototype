const BASE_URL = 'https://api.fonnte.com'
const TOKEN    = process.env.FONNTE_TOKEN

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!TOKEN) {
    console.warn('[WA] FONNTE_TOKEN not set — message not sent to', phone)
    return false
  }

  // Normalize: strip non-digits, remove leading 0, prepend 62
  const normalized = phone.replace(/[^0-9]/g, '').replace(/^0/, '62')

  // Try JSON first, fallback to FormData
  const attempts: Array<() => Promise<Response>> = [
    // Attempt 1: JSON body
    () => fetch(`${BASE_URL}/send`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN!,
        'Content-Type': 'application/json',
        'User-Agent': 'RehanTour/1.0',
      },
      body: JSON.stringify({ target: normalized, message, countryCode: '62' }),
    }),
    // Attempt 2: FormData
    () => {
      const form = new FormData()
      form.append('target', normalized)
      form.append('message', message)
      form.append('countryCode', '62')
      return fetch(`${BASE_URL}/send`, {
        method: 'POST',
        headers: { Authorization: TOKEN!, 'User-Agent': 'RehanTour/1.0' },
        body: form,
      })
    },
    // Attempt 3: URLSearchParams (original)
    () => fetch(`${BASE_URL}/send`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN!,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'RehanTour/1.0',
      },
      body: new URLSearchParams({ target: normalized, message, countryCode: '62' }),
    }),
  ]

  for (let i = 0; i < attempts.length; i++) {
    try {
      const res = await attempts[i]()
      const text = await res.text()
      console.log(`[WA] Attempt ${i + 1} status:`, res.status, text.slice(0, 200))
      let data: Record<string, unknown> = {}
      try { data = JSON.parse(text) } catch { data = { raw: text } }
      if (res.ok && data.status) return true
      if (i === attempts.length - 1) {
        console.error('[WA] All attempts failed. Last response:', data)
      }
    } catch (e) {
      console.error(`[WA] Attempt ${i + 1} error:`, (e as Error).message)
      if (i === attempts.length - 1) return false
    }
  }
  return false
}

// ── Message builders ────────────────────────────────────────────────────────

export function msgBookingConfirmed(b: {
  name: string; code: string; packageTitle: string
  date: string; pickupTime: string; pickupName: string
  guests: number; totalUsd: number; baseUrl?: string
}) {
  const url = b.baseUrl || 'https://rehan-tour-travel-prototype.vercel.app'
  return `Halo ${b.name.split(' ')[0]}! 🎉

Booking kamu berhasil diterima oleh *Rehan Tour & Travel*.

🎫 *Kode Booking:* ${b.code}
📦 *Paket:* ${b.packageTitle}
📅 *Tanggal:* ${b.date}
⏰ *Jam Jemput:* ${b.pickupTime ? b.pickupTime + ' WIB' : 'Akan dikonfirmasi'}
📍 *Pickup:* ${b.pickupName || '—'}
👥 *Tamu:* ${b.guests} orang
💵 *Total:* ${b.totalUsd > 0 ? '$' + b.totalUsd : 'Akan dikonfirmasi via WA'}

Track booking kamu di:
${url}/booking/${b.code}

📋 *Lihat & Print Itinerary:*
${url}/booking/${b.code}/itinerary

Tim akan menghubungi kamu untuk konfirmasi pembayaran.
Terima kasih telah mempercayai *Rehan Tour & Travel*! 🙏`
}

export function msgDriverDispatched(b: {
  customerName: string; driverName: string; packageTitle: string
  date: string; pickupTime: string; pickupName: string
  code: string; baseUrl?: string
}) {
  const url = b.baseUrl || 'https://rehan-tour-travel-prototype.vercel.app'
  return `Halo ${b.customerName.split(' ')[0]}! 🚗

Driver kamu untuk trip besok sudah dikonfirmasi!

🚗 *Driver:* ${b.driverName}
📦 *Paket:* ${b.packageTitle}
📅 *Tanggal:* ${b.date}
⏰ *Jam Jemput:* ${b.pickupTime ? b.pickupTime + ' WIB' : '—'}
📍 *Pickup:* ${b.pickupName}

Pantau posisi driver secara live:
${url}/booking/${b.code}

Sampai jumpa! 🌋`
}

export function msgDriverAccepted(b: {
  customerName: string; driverName: string
  code: string; baseUrl?: string
}) {
  const url = b.baseUrl || 'https://rehan-tour-travel-prototype.vercel.app'
  return `Halo ${b.customerName.split(' ')[0]}! ✅

*${b.driverName}* sudah mengkonfirmasi trip kamu.

Pantau lokasi driver secara live di:
${url}/booking/${b.code}

Jika ada pertanyaan, balas pesan ini.
*Rehan Tour & Travel* 🙏`
}

export function msgH1Customer(b: {
  name: string; packageTitle: string; date: string
  pickupTime: string; pickupName: string
  driverName: string | null; code: string; baseUrl?: string
}) {
  const url = b.baseUrl || 'https://rehan-tour-travel-prototype.vercel.app'
  return `Halo ${b.name.split(' ')[0]}! 👋

Pengingat dari *Rehan Tour & Travel* — trip kamu *besok* sudah siap! 🌋

📦 *Paket:* ${b.packageTitle}
📅 *Tanggal:* ${b.date}
⏰ *Jam Jemput:* ${b.pickupTime ? b.pickupTime + ' WIB' : '—'}
📍 *Pickup:* ${b.pickupName}
🚗 *Driver:* ${b.driverName || 'Segera dikonfirmasi'}
🎫 *Kode:* ${b.code}

*Persiapan:*
- Bawa jaket tebal (suhu gunung bisa 5–10°C) 🧥
- Sepatu tertutup & nyaman 👟
- Charge HP penuh 🔋
- Sarapan sebelum jam jemput 🍽️

Track live: ${url}/booking/${b.code}

📋 *Itinerary lengkap:*
${url}/booking/${b.code}/itinerary

Sampai jumpa besok! 🙏
*Tim Rehan Tour & Travel*`
}

export function msgH1Driver(b: {
  driverName: string; customerName: string; packageTitle: string
  date: string; pickupTime: string; pickupName: string
  guests: number; code: string
}) {
  return `Halo ${b.driverName.split(' ')[0]}! 🚗

Reminder trip *besok* dari Rehan Tour & Travel:

👤 *Tamu:* ${b.customerName} (${b.guests} orang)
📦 *Paket:* ${b.packageTitle}
📅 *Tanggal:* ${b.date}
⏰ *Jam Jemput:* ${b.pickupTime ? b.pickupTime + ' WIB' : '—'}
📍 *Pickup:* ${b.pickupName}
🎫 *Kode:* ${b.code}

Pastikan kendaraan sudah siap & bahan bakar penuh.
Selamat bertugas! 💪`
}
