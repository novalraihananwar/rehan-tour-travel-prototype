export interface DriverState {
  driverId: string | null
  driverName: string
  vehicle: string
  lat: number
  lng: number
  status: string
  bookingCode: string | null
  customerName: string | null
  pickupName: string | null
  pickupLat: number | null
  pickupLng: number | null
  updatedAt: number
}

// In-memory store shared across API routes (single-instance serverless)
export const driverStateStore = new Map<string, DriverState>()
