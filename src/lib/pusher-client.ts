import PusherJS from 'pusher-js'

let instance: PusherJS | null = null

export function getPusherClient(): PusherJS {
  if (typeof window === 'undefined') throw new Error('Pusher only available in browser')
  if (!instance) {
    instance = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    })
  }
  return instance
}
