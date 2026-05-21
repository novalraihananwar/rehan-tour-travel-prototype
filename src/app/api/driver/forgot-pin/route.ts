import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://rehan-tour-travel-prototype.vercel.app'

function buildResetEmailHtml(resetLink: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset PIN Driver — Rehan Tour &amp; Travel</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid #222222;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%);padding:40px 40px 32px;border-bottom:1px solid #222222;text-align:center;">
              <div style="display:inline-block;border:1px solid #c8963e;border-radius:4px;padding:6px 20px;margin-bottom:20px;">
                <span style="font-size:11px;letter-spacing:4px;color:#c8963e;font-weight:600;text-transform:uppercase;">Rehan Tour &amp; Travel</span>
              </div>
              <br/>
              <span style="font-size:11px;letter-spacing:2px;color:#555555;text-transform:uppercase;">Driver Portal</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <span style="display:inline-block;background-color:#c8963e22;color:#c8963e;border:1px solid #c8963e44;border-radius:3px;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:3px 10px;font-weight:600;">Reset PIN</span>
              </div>

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:300;color:#e8e4dc;letter-spacing:1px;text-align:center;">
                Permintaan Reset PIN
              </h1>
              <p style="margin:0 0 32px;font-size:14px;color:#888888;text-align:center;line-height:1.6;">
                Kami menerima permintaan reset PIN untuk akun driver kamu.<br/>
                Klik tombol di bawah untuk membuat PIN baru.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 8px;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#c8963e,#e0ac58);color:#0a0a0a;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 40px;border-radius:4px;">Reset PIN Sekarang</a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:12px;color:#444444;text-align:center;">
                Atau kunjungi link ini:<br/>
                <a href="${resetLink}" style="color:#c8963e;text-decoration:none;word-break:break-all;">${resetLink}</a>
              </p>

              <div style="background:#141414;border-radius:10px;padding:16px 20px;margin:32px 0 0;border-left:3px solid #444444;">
                <p style="margin:0;font-size:12px;color:#666666;line-height:1.6;">
                  Link ini berlaku selama <strong style="color:#c8963e;">1 jam</strong> dan hanya bisa digunakan sekali.<br/>
                  Jika kamu tidak meminta reset PIN, abaikan email ini — PIN kamu tetap aman.
                </p>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#c8963e44,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#555555;letter-spacing:1px;text-transform:uppercase;">Butuh bantuan?</p>
              <p style="margin:0 0 4px;font-size:13px;color:#888888;">
                WhatsApp: <a href="https://wa.me/6281234567890" style="color:#c8963e;text-decoration:none;">+62 812-3456-7890</a>
              </p>
              <p style="margin:0 0 20px;font-size:13px;color:#888888;">
                Email: <a href="mailto:info@rehantour.com" style="color:#c8963e;text-decoration:none;">info@rehantour.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#333333;letter-spacing:1px;">
                &copy; 2026 Rehan Tour &amp; Travel. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

// Always return 200 with a success-looking response to prevent user enumeration.
const FAKE_OK = NextResponse.json({ ok: true })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { username?: unknown; email?: unknown }
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
    const email    = typeof body.email    === 'string' ? body.email.trim().toLowerCase()    : ''

    if (!username || !email) {
      return NextResponse.json({ error: 'Username dan email diperlukan.' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Lookup driver — ilike for case-insensitive username match
    const { data: driver, error: dbError } = await admin
      .from('drivers')
      .select('id, email')
      .ilike('username', username)
      .ilike('email', email)
      .single()

    if (dbError || !driver) {
      // Security: don't reveal whether user exists
      return FAKE_OK
    }

    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // +1 hour

    const { error: insertError } = await admin
      .from('driver_pin_resets')
      .insert({ driver_id: driver.id, token, expires_at: expiresAt })

    if (insertError) {
      console.error('[forgot-pin] Insert error:', insertError)
      return NextResponse.json({ error: 'Server error.' }, { status: 500 })
    }

    const resetLink = `${APP_URL}/driver/reset-pin?token=${token}`

    await sendEmail({
      to:      email,
      subject: '[Rehan Tour] Reset PIN Driver',
      html:    buildResetEmailHtml(resetLink),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[forgot-pin] Unexpected error:', e)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
