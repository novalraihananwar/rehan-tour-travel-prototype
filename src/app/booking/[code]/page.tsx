import type { Metadata } from 'next'
import { BookingTrackerClient } from './client'

export const metadata: Metadata = {
  title: 'Track Your Booking | Rehan Tour & Travel',
}

export default function BookingTrackerPage({ params }: { params: { code: string } }) {
  return <BookingTrackerClient code={params.code} />
}
