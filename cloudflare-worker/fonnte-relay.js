// Cloudflare Worker — Fonnte Relay
// Deploy di: https://dash.cloudflare.com → Workers & Pages → Create Worker
// Setelah deploy, set secret: FONNTE_TOKEN via Settings → Variables → Secrets

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-Relay-Secret',
        },
      })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    // Optional: verify relay secret so only your Vercel app can use this worker
    const relaySecret = request.headers.get('X-Relay-Secret')
    if (env.RELAY_SECRET && relaySecret !== env.RELAY_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const body = await request.json()
    const { target, message, countryCode = '62' } = body

    if (!target || !message) {
      return new Response(JSON.stringify({ error: 'Missing target or message' }), { status: 400 })
    }

    // Forward to Fonnte
    const fonnteRes = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: env.FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target, message, countryCode }),
    })

    const data = await fonnteRes.text()
    return new Response(data, {
      status: fonnteRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  },
}
