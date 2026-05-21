// Per-package pickup time presets
export const PACKAGE_PICKUP_TIMES: Record<string, { default: string; options: string[]; note?: string }> = {
  'bromo-sunrise-tour': {
    default: '22:00',
    options: ['21:00', '21:30', '22:00', '22:30', '23:00'],
    note: 'Malam hari — tiba di Bromo sebelum sunrise ±04:30',
  },
  'bromo-ijen-expedition': {
    default: '22:00',
    options: ['21:00', '22:00', '23:00'],
    note: 'Malam hari dari Surabaya/Malang',
  },
  'surabaya-bali-overland': {
    default: '07:00',
    options: ['06:00', '07:00', '08:00', '09:00'],
    note: 'Perjalanan panjang — disarankan pagi hari',
  },
  'tumpak-sewu-adventure': {
    default: '05:00',
    options: ['04:30', '05:00', '05:30', '06:00'],
    note: 'Subuh — tiba di trek sebelum ramai',
  },
  'malang-hidden-gems': {
    default: '08:00',
    options: ['07:00', '07:30', '08:00', '09:00', '10:00'],
    note: 'Pagi hari untuk seharian keliling Malang',
  },
  'bali-tropical-escape': {
    default: '07:00',
    options: ['06:00', '07:00', '08:00', '09:00'],
    note: 'Pagi hari dari Ngurah Rai / hotel',
  },
  'luxury-east-java-escape': {
    default: '08:00',
    options: ['07:00', '08:00', '09:00'],
  },
  'honeymoon-bali': {
    default: '09:00',
    options: ['08:00', '09:00', '10:00'],
    note: 'Santai — sesuaikan dengan jadwal penerbangan',
  },
}

export const DEFAULT_PICKUP_TIMES = {
  default: '08:00',
  options: ['06:00', '07:00', '08:00', '09:00', '10:00'],
}

export function getPickupTimes(packageSlug: string) {
  return PACKAGE_PICKUP_TIMES[packageSlug] ?? DEFAULT_PICKUP_TIMES
}

// Common pickup location coordinates for distance calculation
export const PICKUP_LOCATION_COORDS: [string, number, number][] = [
  ['juanda',         -7.3813,  112.7870],
  ['gubeng',         -7.2650,  112.7510],
  ['pasar turi',     -7.2449,  112.7306],
  ['malang',         -7.9769,  112.6304],
  ['arjosari',       -7.9477,  112.6530],
  ['tunjungan',      -7.2578,  112.7379],
  ['ngurah rai',     -8.7467,  115.1670],
  ['denpasar',       -8.6500,  115.2167],
  ['ubud',           -8.5069,  115.2625],
  ['kuta',           -8.7228,  115.1686],
  ['seminyak',       -8.6906,  115.1609],
  ['banyuwangi',     -8.2191,  114.3691],
  ['ketapang',       -8.1683,  114.3990],
  ['bromo',          -7.9425,  112.9530],
  ['surabaya',       -7.2504,  112.7688],
]

export function getPickupCoords(pickupName: string): [number, number] | null {
  const lower = pickupName.toLowerCase()
  for (const [key, lat, lng] of PICKUP_LOCATION_COORDS) {
    if (lower.includes(key)) return [lat, lng]
  }
  return null
}

// Haversine distance in km
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function driverChannel(driverName: string): string {
  return `driver-${driverName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`
}
