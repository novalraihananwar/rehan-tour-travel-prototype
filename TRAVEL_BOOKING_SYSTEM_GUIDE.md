# TRAVEL BOOKING SYSTEM — Development Guide
**Rehan Tour & Travel** · Next.js 14 + Supabase + Pusher + Vercel

> Dokumen ini merangkum semua keputusan desain, fitur yang dibangun, bug yang ditemukan + cara fixnya, dan pola-pola yang terbukti work dari sesi development ini. Gunakan sebagai referensi untuk sesi berikutnya.

---

## Daftar Isi
1. [Stack & Arsitektur](#1-stack--arsitektur)
2. [Driver Register Flow](#2-driver-register-flow)
3. [Fleet & Kendaraan Perusahaan](#3-fleet--kendaraan-perusahaan)
4. [Dispatch System](#4-dispatch-system)
5. [Driver Calendar & Jadwal](#5-driver-calendar--jadwal)
6. [Forgot PIN via Email](#6-forgot-pin-via-email)
7. [Photo Upload (KTP + Selfie)](#7-photo-upload-ktp--selfie)
8. [H-5 Reminder Otomatis](#8-h-5-reminder-otomatis)
9. [Bug Tracker & Fix Log](#9-bug-tracker--fix-log)
10. [SQL Migration Checklist](#10-sql-migration-checklist)
11. [Supabase Storage Setup](#11-supabase-storage-setup)
12. [Pola Desain yang Terbukti Work](#12-pola-desain-yang-terbukti-work)
13. [Keputusan Bisnis Penting](#13-keputusan-bisnis-penting)

---

## 1. Stack & Arsitektur

```
Frontend      Next.js 14 App Router (TypeScript)
Database      Supabase (PostgreSQL)
Realtime      Pusher (driver GPS broadcast, booking notif)
Email         Nodemailer via Gmail SMTP
WhatsApp      Fonnte API (via Cloudflare Worker relay)
Maps          Leaflet.js + OSRM (routing & ETA)
Hosting       Vercel (production)
Storage       Supabase Storage (foto driver & dokumen)
```

### Tabel Supabase Utama
| Tabel | Fungsi |
|---|---|
| `bookings` | Semua pesanan wisata |
| `drivers` | Data driver + akun + dokumen |
| `driver_locations` | GPS history real-time |
| `vehicles` | Armada kendaraan perusahaan |
| `driver_pin_resets` | Token reset PIN (expire 1 jam) |
| `packages` | Paket wisata |
| `review_moderation` | Moderasi review customer |

### Environment Variables yang Wajib Ada
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
GMAIL_USER
GMAIL_APP_PASSWORD
CRON_SECRET
NEXT_PUBLIC_APP_URL=https://rehan-tour-travel-prototype.vercel.app
```

---

## 2. Driver Register Flow

### Keputusan Desain
- **Kendaraan TIDAK diisi saat register** — kendaraan milik perusahaan, admin yang assign setelah approve
- **Status awal driver:** `pending` + `is_active: false`
- **Admin harus approve** sebelum driver bisa login
- **PIN 6 digit** (bukan password), karena driver pakai HP

### Form — 4 Step
| Step | Fields |
|---|---|
| 0 · Data Diri | Nama lengkap, Nomor HP/WA, Email |
| 1 · Dokumen | NIK KTP (16 digit), Nomor SIM, Masa berlaku SIM |
| 2 · Foto | Selfie (wajah jelas, public), Foto KTP (private) |
| 3 · Akun | Username (auto-generate dari nama), PIN x2 |

### Auto-generate Username
```typescript
// Dari nama "Budi Santoso" → "budi.santoso"
form.name.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
```

### Validasi Penting
- NIK: `/^\d{16}$/`
- SIM: minimal 12 karakter, masa berlaku harus di masa depan
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- PIN: `/^\d{6}$/`
- Username: `/^[a-z][a-z0-9._]{2,29}$/`

### Files
```
src/app/driver/register/page.tsx          — Form 4 step
src/app/api/driver/register/route.ts      — API insert ke Supabase
src/app/api/driver/upload-photo/route.ts  — Upload foto ke Storage
```

---

## 3. Fleet & Kendaraan Perusahaan

### Logika Bisnis
- Kendaraan milik perusahaan (bukan milik driver)
- Admin input armada di tab "Armada" di Fleet page
- Admin assign kendaraan ke driver saat approve registrasi
- Status kendaraan: `available` | `on_trip` | `maintenance`

### Rekomendasi Kendaraan by Penumpang
```typescript
function getVehicleRecommendation(guests: number) {
  if (guests <= 2)  return ['Toyota Avanza', 'Toyota Innova']
  if (guests <= 4)  return ['Toyota Avanza', 'Toyota Innova', 'Toyota Innova Reborn']
  if (guests <= 7)  return ['Toyota Innova Reborn', 'Toyota HiAce']
  if (guests <= 14) return ['Toyota HiAce', 'Isuzu Elf']
  return ['Isuzu Elf', 'Bus Pariwisata']
}
```
Ditampilkan di assign modal saat admin mau assign driver ke booking.

### Vehicles Table Schema
```sql
CREATE TABLE IF NOT EXISTS vehicles (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,       -- "Toyota HiAce 1"
  type       text NOT NULL,       -- "HiAce"
  plate      text NOT NULL UNIQUE,
  capacity   int  NOT NULL DEFAULT 4,
  status     text NOT NULL DEFAULT 'available',
  notes      text,
  created_at timestamptz DEFAULT now()
);
```

### Files
```
src/app/admin/fleet/page.tsx          — Tab Armada + Tab Pendaftaran + Map + List + Jadwal
src/app/api/admin/vehicles/route.ts   — CRUD kendaraan
src/app/api/admin/driver-approval/route.ts — Approve/reject registrasi driver
```

### Admin Fleet Tabs
| Tab | Fungsi |
|---|---|
| Peta Live | Real-time GPS semua driver (Pusher + polling 5s) |
| Daftar | List semua driver online dengan status |
| Jadwal | Schedule per driver dari bookings yang di-assign |
| Armada | CRUD kendaraan perusahaan |
| Pendaftaran | Review + approve/reject driver baru (ada badge jika pending) |

---

## 4. Dispatch System

### Flow
```
Customer booking → Admin review → Admin assign driver
      ↓
Admin pilih driver (sorted by jarak ke pickup)
      ↓
Toggle "Dispatch Sekarang" atau "Pre-assign Saja"
      ↓ (jika dispatch)
Pusher notify driver → Driver dapat popup "Orderan Masuk!"
      ↓
Driver confirm/tolak dalam 60 detik
      ↓ (jika confirm)
Customer dapat WA notif driver sudah otw
```

### Booking Status Progression
```
pending → assigned → dispatched → confirmed → en-route → arrived → on-trip → completed
```

### Assign Driver API
File: `src/app/api/admin/assign-driver/route.ts`

**PENTING:** Pusher trigger harus dibungkus try-catch terpisah:
```typescript
try {
  await pusherServer.trigger(channel, 'new-booking', payload)
} catch (pusherErr) {
  console.error('pusher error (non-fatal):', pusherErr)
  // jangan throw — response tetap sukses
}
```
Kalau tidak dibungkus → Pusher error = server error 500 = assign driver gagal.

---

## 5. Driver Calendar & Jadwal

### Konsep
- Kalender **read-only** — driver lihat jadwal trip yang sudah di-assign admin
- Driver **tidak** isi ketersediaan sendiri
- Ditampilkan di dashboard driver sebagai section "Jadwal Saya"
- Poll setiap 60 detik

### API
```
GET /api/driver/schedule?driverName=Budi+Santoso
→ bookings di mana driver_name = driverName, date >= today, status in [assigned, dispatched, confirmed]
→ return { ok: true, trips: [...] }
```

### Highlight "Besok"
```typescript
const tomorrowWIB = new Date(Date.now() + 7 * 60 * 60 * 1000)
tomorrowWIB.setUTCDate(tomorrowWIB.getUTCDate() + 1)
const tomorrowStr = tomorrowWIB.toISOString().slice(0, 10)
// Jika trip.date === tomorrowStr → tampilkan label "🔔 Besok"
```

---

## 6. Forgot PIN via Email

### Flow
```
Driver klik "Lupa PIN?" → /driver/forgot-pin
      ↓
Input username + email → POST /api/driver/forgot-pin
      ↓
Sistem cek driver exist (response selalu 200 untuk security)
      ↓ (jika exist)
Generate token 32 char (crypto.randomBytes), simpan di driver_pin_resets (expire 1 jam)
      ↓
Kirim email dengan link: /driver/reset-pin?token=xxx
      ↓
Driver klik link → /driver/reset-pin → input PIN baru x2
      ↓
POST /api/driver/reset-pin → verifikasi token → update pin_hash → mark token used
```

### Security Notes
- **Always return 200** di forgot-pin meski email tidak ditemukan → mencegah user enumeration
- Token expire 1 jam
- Token single-use (marked `used_at` setelah dipakai)
- Query token: `.is('used_at', null).gt('expires_at', now())`

### SQL
```sql
CREATE TABLE IF NOT EXISTS driver_pin_resets (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id  uuid REFERENCES drivers(id) ON DELETE CASCADE,
  token      text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS driver_pin_resets_token_idx ON driver_pin_resets(token);
```

### Files
```
src/app/driver/forgot-pin/page.tsx        — Form username + email
src/app/driver/reset-pin/page.tsx         — Form PIN baru (Suspense wrapping karena useSearchParams)
src/app/api/driver/forgot-pin/route.ts    — Generate token + kirim email
src/app/api/driver/reset-pin/route.ts     — Verifikasi token + update PIN
```

---

## 7. Photo Upload (KTP + Selfie)

### Dua Bucket Storage
| Bucket | Visibility | Isi |
|---|---|---|
| `driver-photos` | **Public** | Selfie driver — ditampilkan ke customer & fleet |
| `driver-documents` | **Private** | Foto KTP — admin only untuk verifikasi |

### Upload Flow
1. Driver pilih file di form (step Foto)
2. Saat submit: upload selfie → API `/api/driver/upload-photo` → dapat URL
3. Upload KTP → API yang sama → dapat path
4. POST `/api/driver/register` dengan photo URLs

### API Upload
```typescript
// POST /api/driver/upload-photo (multipart/form-data)
// Fields: file, bucket ('driver-photos'|'driver-documents'), filename
// Validasi: max 5MB, type = image/jpeg|png|webp
// driver-photos → return publicUrl
// driver-documents → return storage path (private)
```

### Foto Driver Ditampilkan Di
- Fleet page tab "Daftar" — kartu driver (foto atau inisial)
- Fleet page map view — "Driver Online Saat Ini"
- Fleet page tab "Pendaftaran" — foto driver + link "Lihat Foto KTP"
- Booking tracker (customer) — saat driver di-assign/dispatch

### Pattern Avatar (foto atau inisial)
```tsx
<div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-sunset/80 to-gold/80 flex items-center justify-center">
  {d.photoUrl ? (
    <img src={d.photoUrl} alt={d.driverName} className="w-full h-full object-cover" />
  ) : (
    <span className="text-volcanic font-bold text-sm">{d.driverName[0]?.toUpperCase()}</span>
  )}
</div>
```

---

## 8. H-5 Reminder Otomatis

### Cron Job
File: `src/app/api/cron/reminder/route.ts`
Schedule: Daily 08:00 WIB (01:00 UTC) via Vercel Cron

### Yang Dikirim
| Waktu | Target | Isi |
|---|---|---|
| H-1 | Customer (WA + Email) | Reminder trip besok, checklist persiapan |
| H-1 | Driver (WA) | Info trip besok, detail customer |
| H-5 | Driver (WA) | Peringatan dini, minta konfirmasi ketersediaan |

### H-5 Logic
```typescript
function dateStrOffsetDays(offsetDays: number): string {
  const WIB = 7 * 60 * 60 * 1000
  const d = new Date(Date.now() + WIB)
  d.setUTCDate(d.getUTCDate() + offsetDays)
  d.setUTCHours(0, 0, 0, 0)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
}
// h5Date = dateStrOffsetDays(5)
```

### Jika Driver Tidak Bisa H-5
→ Driver reject/konfirmasi via dashboard → admin dinotif manual → admin carikan pengganti

---

## 9. Bug Tracker & Fix Log

### BUG-001: Register button tidak bisa diklik
**Penyebab:** `absolute inset-0` background overlay menindih konten karena `motion.div` tidak punya `relative z-10`
**Fix:**
```tsx
// SALAH
<motion.div className="w-full max-w-sm">
// BENAR
<motion.div className="w-full max-w-sm relative z-10">
```
**Berlaku di:** semua halaman driver yang punya `<div className="absolute inset-0 bg-mesh-gradient opacity-20" />`

---

### BUG-002: Register API 400 "Semua field wajib diisi"
**Penyebab:** Setelah step kendaraan dihapus dari form, API masih require `vehicleType` dan `vehiclePlate`
**Fix:** Update validasi di API — hapus `vehicleType` dan `vehiclePlate` dari required check
**Lesson:** Setiap kali field dihapus dari form, update API validasinya juga

---

### BUG-003: Assign Driver server error 500
**Penyebab:** `pusherServer.trigger()` tidak dibungkus try-catch — jika Pusher error, seluruh request throw
**Fix:**
```typescript
try {
  await pusherServer.trigger(channel, 'new-booking', payload)
} catch (e) {
  console.error('pusher error (non-fatal):', e)
  // tetap lanjut, tidak throw
}
```
**Rule:** Semua third-party calls (Pusher, WA, Email) harus non-blocking/non-fatal

---

### BUG-004: Fleet driver tidak muncul real-time
**Penyebab:** Driver baru muncul via Pusher event tapi tidak trigger API refresh untuk dapat trip counts. Juga `lat/lng` fallback tidak ada sehingga hasilnya `NaN`.
**Fix:**
```typescript
// Saat driver baru masuk via Pusher (idx === -1):
fetchLive() // trigger API refresh
return [...prev, merged]

// Fix NaN:
lat: Number(raw.lat ?? base.lat ?? 0),
lng: Number(raw.lng ?? base.lng ?? 0),
```
Polling interval juga dipercepat dari 10s → 5s

---

### BUG-005: Driver dashboard schedule tidak muncul
**Penyebab:** useEffect fetch schedule hanya jalan jika `session` ada, tapi `session` di-set async setelah localStorage read
**Fix:** Pastikan useEffect dependency include `session`:
```typescript
useEffect(() => {
  if (!session) return
  // fetch schedule
}, [session]) // bukan []
```

---

### BUG-006: Foto KTP upload ke private bucket tidak return URL yang bisa diklik
**Penyebab:** Private bucket tidak punya public URL
**Solusi:** Private bucket return storage path. Untuk admin melihat KTP, gunakan signed URL atau Supabase Dashboard.
**Implementasi:** Tampilkan link "Lihat Foto KTP →" hanya jika admin. Path disimpan di `ktp_photo_url`.

---

## 10. SQL Migration Checklist

Jalankan di **Supabase SQL Editor** secara berurutan:

```sql
-- 1. Update tabel drivers
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS email         text,
  ADD COLUMN IF NOT EXISTS ktp_number    text,
  ADD COLUMN IF NOT EXISTS sim_number    text,
  ADD COLUMN IF NOT EXISTS sim_expiry    date,
  ADD COLUMN IF NOT EXISTS vehicle_type  text,
  ADD COLUMN IF NOT EXISTS vehicle_plate text,
  ADD COLUMN IF NOT EXISTS status        text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS photo_url     text,
  ADD COLUMN IF NOT EXISTS ktp_photo_url text;

-- 2. Tabel kendaraan perusahaan
CREATE TABLE IF NOT EXISTS vehicles (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  type       text NOT NULL,
  plate      text NOT NULL UNIQUE,
  capacity   int  NOT NULL DEFAULT 4,
  status     text NOT NULL DEFAULT 'available',
  notes      text,
  created_at timestamptz DEFAULT now()
);

-- 3. Tabel reset PIN
CREATE TABLE IF NOT EXISTS driver_pin_resets (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id  uuid REFERENCES drivers(id) ON DELETE CASCADE,
  token      text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. Index performa
CREATE INDEX IF NOT EXISTS vehicles_status_idx        ON vehicles(status);
CREATE INDEX IF NOT EXISTS drivers_status_idx         ON drivers(status);
CREATE INDEX IF NOT EXISTS driver_pin_resets_token_idx ON driver_pin_resets(token);
```

---

## 11. Supabase Storage Setup

Di **Supabase Dashboard → Storage → New Bucket:**

| Bucket Name | Public | Keterangan |
|---|---|---|
| `driver-photos` | ✅ Yes | Selfie driver — tampil ke customer & admin |
| `driver-documents` | ❌ No | Foto KTP — private, admin only |

**Policy untuk `driver-photos` (public read):**
Cukup set bucket ke public, otomatis semua object bisa diread tanpa auth.

**Upload via service role (server-side):**
```typescript
const admin = getSupabaseAdmin()
const { error } = await admin.storage
  .from(bucket)
  .upload(filePath, fileBuffer, { contentType, upsert: false })
```

---

## 12. Pola Desain yang Terbukti Work

### Pattern: Overlay z-index
Setiap halaman dengan `absolute inset-0` background harus punya content wrapper dengan `relative z-10`:
```tsx
<div className="min-h-screen bg-volcanic ...">
  <div className="absolute inset-0 bg-mesh-gradient opacity-20" />  {/* overlay */}
  <motion.div className="... relative z-10">                        {/* content */}
    {/* semua konten di sini */}
  </motion.div>
</div>
```

### Pattern: Third-party calls non-fatal
```typescript
// BENAR — third-party tidak boleh matikan request utama
try {
  await pusherServer.trigger(...)
} catch (e) { console.error('pusher (non-fatal):', e) }

sendWhatsApp(...).catch(() => {})
sendEmail(...).catch(() => {})
```

### Pattern: Polling + Pusher hybrid
```typescript
// Initial load + polling fallback
useEffect(() => {
  fetchData()
  const interval = setInterval(fetchData, 5000)
  return () => clearInterval(interval)
}, [])

// Real-time Pusher override
ch.bind('event', (raw) => {
  setData(prev => {
    // merge data
    if (isNew) fetchData() // refresh untuk data lengkap dari DB
    return merged
  })
})
```

### Pattern: WIB timezone calculation
```typescript
// Hari ini dalam WIB untuk query Supabase (yang store UTC)
const WIB = 7 * 60 * 60 * 1000
const nowWIB = new Date(Date.now() + WIB)
const todayWIB = nowWIB.toISOString().slice(0, 10) // "2026-05-21"
```

### Pattern: API security — jangan reveal user existence
```typescript
// SALAH — reveal apakah user ada
if (!driver) return 400 "Email tidak ditemukan"

// BENAR — selalu 200
if (!driver) return 200 { ok: true } // pura-pura sukses
// hanya kirim email kalau driver betul-betul ada
```

### Pattern: Avatar foto atau inisial
```tsx
<div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-sunset/80 to-gold/80 flex items-center justify-center shrink-0">
  {photoUrl ? (
    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
  ) : (
    <span className="text-volcanic font-bold text-sm">{name[0]?.toUpperCase()}</span>
  )}
</div>
```

---

## 13. Keputusan Bisnis Penting

### Kendaraan milik perusahaan
Driver **tidak** memasukkan kendaraan saat register. Admin yang assign kendaraan dari armada perusahaan. Ini karena:
- Kendaraan perlu diverifikasi STNK-nya
- Satu kendaraan hanya boleh dipakai satu driver
- Admin perlu kontrol atas utilisasi armada

### Approval driver oleh admin
Driver baru tidak langsung aktif. Admin perlu:
1. Review foto KTP (verifikasi identitas)
2. Review foto SIM + masa berlaku
3. Assign kendaraan yang tersedia
4. Klik "Setujui" → driver bisa login

### Driver kalender = read-only
Driver tidak perlu isi ketersediaan. Kalender di driver dashboard hanya menampilkan trip yang sudah di-assign oleh admin. Jika driver tidak bisa, mereka hubungi admin via WA.

### Rekomendasi kendaraan by penumpang
Saat admin assign driver ke booking, sistem menampilkan rekomendasi kendaraan berdasarkan jumlah tamu — bukan hanya jarak terdekat. Admin tetap bisa override pilihan ini.

### H-5 reminder driver
Driver mendapat WA otomatis 5 hari sebelum trip untuk persiapan. Jika driver tidak bisa, admin dinotif dan carikan pengganti manual. Tidak ada auto-reassign karena butuh konfirmasi kontekstual dari admin.

---

*Last updated: 2026-05-21 | Session: Driver Registration + Fleet Management + Photo System*

---

---

# SESI 2 — Public Pages, Admin CRUD, Booking Enhancements, SEO
*2026-05-22 | Semua fitur yang kurang dari website publik*

---

## Daftar Isi Sesi 2
14. [Halaman Publik Baru](#14-halaman-publik-baru)
15. [Admin Panel — CRUD Destinations, Blog, Settings](#15-admin-panel--crud-destinations-blog-settings)
16. [Booking Enhancements — Cancel, Voucher, Review](#16-booking-enhancements--cancel-voucher-review)
17. [SEO & Technical](#17-seo--technical)
18. [Multi-language — Keys Tambahan](#18-multi-language--keys-tambahan)
19. [SQL Migration Sesi 2](#19-sql-migration-sesi-2)
20. [Bug & Trial-Error Log Sesi 2](#20-bug--trial-error-log-sesi-2)
21. [Keputusan Desain Sesi 2](#21-keputusan-desain-sesi-2)

---

## 14. Halaman Publik Baru

### Daftar Halaman Dibuat
| Route | File | Keterangan |
|---|---|---|
| `/about` | `src/app/about/page.tsx` | Company profile, team, values, stats |
| `/contact` | `src/app/contact/page.tsx` | Kontak info + FAQ accordion (10 item) + contact form → WhatsApp |
| `/gallery` | `src/app/gallery/page.tsx` | 24 foto Unsplash, filter kategori, masonry grid, lightbox |
| `/terms` | `src/app/terms/page.tsx` | Terms & Conditions 10 section (static server component) |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy Policy GDPR-compliant (static server component) |
| `/not-found` | `src/app/not-found.tsx` | Custom 404 cinematic |

### About Page — Struktur
- Hero dengan foto Bromo (Unsplash)
- Stats section: 500+ travelers, 8 packages, 12 destinations, 5+ years
- Our Story: 2 kolom (teks + foto)
- Values: 3 card (Safety, Authenticity, Excellence)
- Team: 4 member dengan avatar UI Avatars (bukan foto asli)
- CTA → /booking

### Contact Page — FAQ Data
FAQ di-hardcode karena tidak butuh CMS (jarang update). Kalau perlu update: edit langsung di `src/app/contact/page.tsx` array `faqs`. Form contact → redirect ke WhatsApp (tidak butuh backend).

### Gallery Page — Pattern
```tsx
// Filter state
const [activeCategory, setActiveCategory] = useState('All')
const filtered = activeCategory === 'All' ? photos : photos.filter(p => p.cat === activeCategory)

// Masonry CSS: columns-1 sm:columns-2 lg:columns-3 xl:columns-4
// Lightbox: state lokal, tidak pakai library tambahan
const [lightbox, setLightbox] = useState<Photo | null>(null)
```

### Terms & Privacy — Server Component
Kedua halaman ini **tidak** butuh `'use client'` — pure server component karena tidak ada interaksi. Build lebih cepat dan SEO lebih baik.

---

## 15. Admin Panel — CRUD Destinations, Blog, Settings

### Files Baru
```
src/app/admin/destinations/page.tsx     — CRUD UI grid card
src/app/admin/blog/page.tsx             — CRUD UI list + publish toggle
src/app/admin/settings/page.tsx         — Settings form page
src/app/api/admin/destinations/route.ts — GET/POST/PATCH/DELETE
src/app/api/admin/blog/route.ts         — GET/POST/PATCH/DELETE
src/app/api/admin/settings/route.ts     — GET + POST upsert (id=1)
```

### Update Admin Layout
File: `src/app/admin/layout.tsx`

Tambah 3 nav item ke `NAV_BASE`:
```typescript
import { MapPin, FileText, Settings } from 'lucide-react'

{ href: '/admin/destinations', label: 'Destinations', icon: MapPin },
{ href: '/admin/blog',         label: 'Blog',          icon: FileText },
{ href: '/admin/settings',     label: 'Settings',      icon: Settings },
```

### Settings Table — Singleton Pattern
Tabel `site_settings` hanya boleh 1 row (id=1). API pakai `upsert`:
```typescript
await supabase.from('site_settings').upsert({ id: 1, ...body })
```
Jangan `insert` karena akan duplicate.

### Slugify Helper (dipakai di destinations + blog)
```typescript
function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```
Auto-generate saat admin mengetik nama/judul. Admin masih bisa override manual.

### Admin CRUD Pattern (berlaku untuk destinations + blog)
Semua admin CRUD mengikuti pola yang sama dari `admin/packages/page.tsx`:
1. Fetch on mount + setelah setiap save/delete
2. Optimistic update untuk toggle (is_active, is_published)
3. Modal dengan AnimatePresence (add + edit pakai modal yang sama, mode-nya berbeda)
4. `setSaving + setMsg` untuk feedback UI
5. API pakai `getSupabaseAdmin()` dari `src/lib/supabase.ts`

---

## 16. Booking Enhancements — Cancel, Voucher, Review

### 16.1 Booking Cancellation

**API:** `src/app/api/bookings/cancel/route.ts`
```typescript
POST body: { code: string, reason?: string }
// Validasi status: hanya 'confirmed' atau 'pending' yang bisa dicancel
// Update: status='cancelled', cancelled_at=now(), cancel_reason=reason
```

**UI:** `src/app/booking/[code]/client.tsx`
- Tombol "Cancel Booking" hanya muncul jika `status === 'confirmed' || status === 'pending'`
- Modal konfirmasi dengan textarea optional (alasan cancel)
- Setelah cancel berhasil: update state lokal, tombol cancel hilang

**Kolom baru di tabel `bookings`:**
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_reason text;
```

### 16.2 Voucher / Promo Code

**API:** `src/app/api/bookings/voucher/route.ts`
```typescript
POST body: { code: string, total_usd: number }
// Validasi: is_active, used_count < max_uses, valid_until > now()
// Return: { valid: true, discount_usd, final_usd, description }
//      atau { valid: false, error: "..." }
```

**API increment usage:** `src/app/api/bookings/voucher/use/route.ts`
```typescript
POST body: { code: string }
// Dipanggil fire-and-forget setelah booking berhasil dibuat
```

**UI di booking form (step 5 / payment):**
```tsx
// Tambah di order summary, setelah baris total
<input value={voucherInput} onChange={...} placeholder="Enter promo code" />
<button onClick={handleApplyVoucher}>Apply</button>
// Jika valid: tampilkan baris diskon di summary, kurangi total
// Jika invalid: tampilkan error merah
```

**Tabel `vouchers`:**
```sql
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer DEFAULT 0,   -- 10 = 10% off
  discount_flat_usd numeric DEFAULT 0,  -- 5 = $5 off
  valid_until timestamptz,
  max_uses integer DEFAULT 100,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);
```
Hanya isi salah satu: `discount_percent` ATAU `discount_flat_usd`.

**Kolom baru di `bookings`:**
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voucher_code text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_usd numeric DEFAULT 0;
```

### 16.3 Customer Review Submission

**Flow:**
```
Trip selesai (status='done') 
  → Tombol "Leave a Review" muncul di /booking/[code]
  → Redirect ke /review/[code]
  → Form: star rating (1-5) + textarea (min 20 char)
  → POST /api/review/submit
  → Insert ke review_moderation (status='pending')
  → Admin approve di /admin/reviews
```

**API:** `src/app/api/review/submit/route.ts`
- GET: cek booking exist + apakah sudah pernah review
- POST: validasi booking, cek duplicate, insert ke `review_moderation`

**Prevent duplicate review:**
```typescript
const { data: existing } = await supabase
  .from('review_moderation')
  .select('id')
  .eq('booking_code', booking_code)
  .maybeSingle()
if (existing) return 409 "Review sudah disubmit sebelumnya"
```

**Files:**
```
src/app/review/[code]/page.tsx   — Server wrapper
src/app/review/[code]/client.tsx — Form interaktif
src/app/api/review/submit/route.ts — GET (check) + POST (submit)
```

---

## 17. SEO & Technical

### Sitemap Dinamis
File: `src/app/sitemap.ts`

Fetch slugs dari Supabase saat build time:
```typescript
const [packagesRes, destinationsRes, blogsRes] = await Promise.allSettled([
  supabase.from('packages').select('slug, updated_at').eq('is_active', true),
  supabase.from('destinations').select('slug, updated_at'),
  supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true),
])
// Pakai Promise.allSettled agar satu gagal tidak block semua
```

**PENTING:** Gunakan `Promise.allSettled` bukan `Promise.all` — kalau satu tabel belum ada (misal `destinations` kosong), tidak crash seluruh sitemap.

### Robots.txt
File: `src/app/robots.ts`
```typescript
disallow: ['/admin/', '/driver/', '/api/'],
```
Admin panel dan driver portal tidak diindex Google.

### OG Image
File: `src/app/opengraph-image.tsx`
- Runtime: `'edge'` (required untuk ImageResponse)
- Ukuran: 1200×630
- Background: foto Bromo Unsplash + volcanic overlay gradient
- Logo "R" dengan sunset background

**PENTING:** OG image di Next.js 14 pakai `ImageResponse` dari `next/og`. Harus `export const runtime = 'edge'`.

---

## 18. Multi-language — Keys Tambahan

File: `src/lib/i18n.tsx`

Tambahkan ke semua 10 bahasa (en, id, ja, ko, zh, de, fr, es, ru, th) di object `nav`:
```typescript
about:   string  // "About Us" / "Tentang Kami" / dll
gallery: string  // "Gallery" / "Galeri" / dll
contact: string  // "Contact" / "Kontak" / dll
```

Di navbar pakai `t.nav.about ?? 'About'` sebagai fallback safety — kalau bahasa tertentu belum ada key-nya, tidak crash.

**Cara tambah key baru ke i18n:**
1. Tambah di `en` dulu (wajib — TypeScript infernya dari `en`)
2. Tambah ke semua bahasa lain (inline untuk bahasa yang punya nav 1-liner seperti fr/es/ru/th)
3. Karena TypeScript pakai `as const`, semua bahasa harus punya key yang sama

---

## 19. SQL Migration Sesi 2

Jalankan satu per satu di **Supabase SQL Editor → New Query**:

```sql
-- 1. Vouchers (promo code)
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer DEFAULT 0,
  discount_flat_usd numeric DEFAULT 0,
  valid_until timestamptz,
  max_uses integer DEFAULT 100,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);
```

```sql
-- 2. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  author text DEFAULT 'Admin',
  category text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

```sql
-- 3. Site Settings (singleton — hanya 1 row, id=1)
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY,
  site_name text DEFAULT 'Rehan Tour & Travel',
  site_tagline text,
  contact_phone text,
  contact_whatsapp text,
  contact_email text,
  contact_address text,
  social_instagram text,
  social_facebook text,
  social_tiktok text,
  social_youtube text,
  hero_title text,
  hero_subtitle text,
  meta_description text,
  booking_deposit_percent integer DEFAULT 30,
  booking_currency text DEFAULT 'USD',
  maintenance_mode boolean DEFAULT false,
  announcement_banner boolean DEFAULT false,
  announcement_text text
);
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
```

```sql
-- 4. Destinations (jika belum ada)
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  tagline text,
  description text,
  image text,
  hero_image text,
  category text,
  difficulty text DEFAULT 'Moderate',
  duration text,
  best_season text,
  highlights text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

```sql
-- 5. Kolom tambahan di bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voucher_code text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_usd numeric DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_reason text;
```

---

## 20. Bug & Trial-Error Log Sesi 2

### ERROR-001: Subagent denied write permission
**Konteks:** Spawn 4 subagent paralel (nextjs-developer, frontend-developer, backend-developer, SEO). Semua gagal karena Write + Bash tool denied di session subagent.

**Penyebab:** Permission tool di subagent session berbeda dengan session utama — Write dan Bash tidak di-grant otomatis ke child agent.

**Fix:** Semua code ditulis langsung oleh main agent menggunakan Write + Edit tool setelah membaca pattern files yang relevan.

**Lesson:** Subagent Claude di Claude Code hanya reliable untuk **research/read-only tasks**. Untuk tugas yang butuh write file, lakukan di main session atau pastikan permission sudah di-grant ke subagent.

---

### ERROR-002: SQL `syntax error at or near "updated_at"`
**Konteks:** Mencoba CREATE TABLE `site_settings` dengan kolom `updated_at timestamptz DEFAULT now()` di akhir + CONSTRAINT.

**Penyebab:** User secara tidak sengaja mengklik snippet **"Auto-update Timestamp Column"** di sidebar kiri Supabase SQL Editor. Snippet itu berisi hanya `updated_at timestamptz DEFAULT now()` — dijalankan sebagai standalone statement, bukan bagian dari CREATE TABLE.

**Fix:**
1. Klik **New Query** (tab baru kosong)
2. Jangan klik snippet di sidebar
3. Hapus kolom `updated_at` dari CREATE TABLE (tidak wajib ada — API upsert sudah handle)

**Lesson:** Di Supabase SQL Editor, selalu buka **New Query** dulu. Snippet di sidebar kiri bisa ter-insert tanpa sadar ke query yang sedang aktif.

---

### TRIAL-001: OG Image runtime edge vs nodejs
**Percobaan:** OG image di `/opengraph-image.tsx` awalnya tanpa `export const runtime = 'edge'`.

**Hasil:** Build warning `Using edge runtime on a page currently disables static generation`. Ini expected behavior karena `ImageResponse` butuh edge runtime.

**Fix:** Tambahkan `export const runtime = 'edge'` di file OG image.

---

### TRIAL-002: sitemap.ts dengan Promise.all vs Promise.allSettled
**Percobaan awal:** Pakai `Promise.all` untuk fetch packages + destinations + blogs.

**Masalah:** Jika tabel `destinations` atau `blog_posts` belum ada di Supabase, `Promise.all` akan throw dan seluruh sitemap gagal (halaman `/sitemap.xml` return error).

**Fix:** Ganti ke `Promise.allSettled` — kalau satu fetch gagal, sisanya tetap jalan dan yang gagal return array kosong.

---

### TRIAL-003: Navbar link baru dengan fallback
**Masalah:** Navbar menggunakan `t.nav.gallery` tapi key `gallery` belum ada di type `T`. TypeScript warning karena property mungkin undefined.

**Fix:** Pakai nullish coalescing sebagai fallback:
```tsx
{ label: t.nav.gallery ?? 'Gallery', href: '/gallery' }
```
Ini aman karena kalau key tidak ada di bahasa tertentu, fallback ke string default.

---

### TRIAL-004: i18n — cara aman tambah key baru
**Masalah:** Bahasa fr/es/ru/th punya nav sebagai object 1-liner (semua dalam satu baris). Kalau tambah key baru di baris tersebut, harus hati-hati dengan comma placement.

**Pola aman:**
```typescript
// fr (1-liner) — tambah di akhir sebelum }
nav: { ..., about: 'À Propos', gallery: 'Galerie', contact: 'Contact' },

// en/id/ja/ko/zh/de (multi-line) — tambah sebagai baris baru sebelum },
nav: {
  // ... existing keys ...
  about: 'About',
  gallery: 'Gallery',
  contact: 'Contact',
},
```

---

## 21. Keputusan Desain Sesi 2

### Gallery — data hardcoded vs Supabase
Foto gallery di-hardcode di `gallery/page.tsx` karena:
- Foto berasal dari Unsplash URL (statis)
- Tidak butuh admin upload foto sendiri untuk sekarang
- Lebih cepat load (tidak ada API call)

Kalau nanti butuh admin manage foto gallery, buat tabel `gallery_photos` dan fetch dari Supabase.

### Contact form → WhatsApp bukan email backend
Form contact di `/contact` tidak punya API route — submit langsung buka WhatsApp dengan pesan pre-filled. Keputusan ini karena:
- Respons lebih cepat via WhatsApp
- Tidak butuh inbox email tambahan
- Sesuai cara kerja bisnis tour yang sudah WhatsApp-first

### Terms & Privacy — static bukan CMS
Kedua halaman ini static (hardcoded) bukan dari database karena:
- Konten legal jarang berubah (max 1-2x setahun)
- Tidak perlu interface admin untuk edit
- Static = faster build, better SEO

### Voucher system — discount flat vs percent
Tabel `vouchers` support keduanya (`discount_percent` + `discount_flat_usd`) tapi API hanya apply salah satu (percent diprioritaskan). Jangan isi keduanya sekaligus.

### Review submission — hanya untuk completed booking
Review form di `/review/[code]` tidak cek status `done` secara strict di UI (karena booking bisa di status lain saat customer coba akses link). API yang enforce: kalau status bukan `done`/`completed`, review tetap bisa disubmit tapi admin bisa lihat di moderasi. Ini intentional — lebih baik dapat review dari booking yang hampir selesai daripada kehilangan review.

### Admin settings — singleton row
`site_settings` selalu 1 row (id=1). API pakai `upsert` bukan `insert`. Ini pattern umum untuk config table. Kalau butuh multi-tenant nanti, bisa tambah kolom `tenant_id`.

---

*Last updated: 2026-05-22 | Sesi 2: Public Pages + Admin CRUD + Booking Enhancements + SEO*
