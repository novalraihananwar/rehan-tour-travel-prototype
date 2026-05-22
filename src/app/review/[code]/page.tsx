import type { Metadata } from 'next'
import { ReviewClient } from './client'

export const metadata: Metadata = {
  title: 'Leave a Review | Rehan Tour & Travel',
}

export default function ReviewPage({ params }: { params: { code: string } }) {
  return <ReviewClient code={params.code} />
}
