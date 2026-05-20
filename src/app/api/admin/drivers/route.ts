import { NextResponse } from 'next/server'
import { driverStateStore } from '@/lib/driver-state'

export async function GET() {
  const drivers = Array.from(driverStateStore.values()).filter(
    (d) => Date.now() - d.updatedAt < 30 * 60 * 1000
  )
  return NextResponse.json(drivers)
}
