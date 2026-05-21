import nodemailer from 'nodemailer'

// ── Transporter ───────────────────────────────────────────────────────────────

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// ── Core sender ───────────────────────────────────────────────────────────────

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[EMAIL] GMAIL_USER or GMAIL_APP_PASSWORD not set — email not sent to', opts.to)
    return false
  }

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"Rehan Tour & Travel" <${process.env.GMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    console.log('[EMAIL] Sent to', opts.to, '—', opts.subject)
    return true
  } catch (e) {
    console.error('[EMAIL] Failed to send email:', e)
    return false
  }
}

// ── Shared HTML layout ────────────────────────────────────────────────────────

function wrapLayout(innerHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rehan Tour &amp; Travel</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid #222222;">

          <!-- Header / Logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%);padding:40px 40px 32px;border-bottom:1px solid #222222;text-align:center;">
              <div style="display:inline-block;border:1px solid #c8963e;border-radius:4px;padding:6px 20px;margin-bottom:20px;">
                <span style="font-size:11px;letter-spacing:4px;color:#c8963e;font-weight:600;text-transform:uppercase;">Rehan Tour &amp; Travel</span>
              </div>
              <br/>
              <span style="font-size:11px;letter-spacing:2px;color:#555555;text-transform:uppercase;">East Java &amp; Bali Experiences</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${innerHtml}
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

// ── Shared components ─────────────────────────────────────────────────────────

function buildBookingTable(rows: Array<{ label: string; value: string }>): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:12px;letter-spacing:1px;color:#666666;text-transform:uppercase;white-space:nowrap;vertical-align:top;width:40%;padding-right:16px;">${r.label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:14px;color:#e8e4dc;font-weight:500;vertical-align:top;">${r.value}</td>
    </tr>`).join('')

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>`
}

function buildCTAButton(label: string, href: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 8px;">
    <tr>
      <td align="center">
        <a href="${href}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#c8963e,#e0ac58);color:#0a0a0a;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 40px;border-radius:4px;">${label}</a>
      </td>
    </tr>
  </table>`
}

function buildBadge(text: string, color: string = '#c8963e'): string {
  return `<span style="display:inline-block;background-color:${color}22;color:${color};border:1px solid ${color}44;border-radius:3px;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:3px 10px;font-weight:600;">${text}</span>`
}

// ── Email: Booking Confirmed ──────────────────────────────────────────────────

export function emailBookingConfirmed(b: {
  name: string
  code: string
  packageTitle: string
  date: string
  pickupTime: string
  pickupName: string
  guests: number
  totalUsd: number
}): { subject: string; html: string } {
  const trackUrl = `https://rehan-tour-travel-prototype.vercel.app/booking/${b.code}`
  const firstName = b.name.split(' ')[0]

  const inner = `
    <!-- Status badge -->
    <div style="text-align:center;margin-bottom:28px;">
      ${buildBadge('Booking Diterima', '#22c55e')}
    </div>

    <!-- Greeting -->
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:300;color:#e8e4dc;letter-spacing:1px;text-align:center;">
      Halo, ${firstName}!
    </h1>
    <p style="margin:0 0 32px;font-size:14px;color:#888888;text-align:center;line-height:1.6;">
      Booking kamu telah <strong style="color:#22c55e;">berhasil diterima</strong> oleh Rehan Tour &amp; Travel.<br/>
      Tim kami akan menghubungi kamu untuk konfirmasi pembayaran.
    </p>

    <!-- Booking code highlight -->
    <div style="background:linear-gradient(135deg,#1a1a1a,#141414);border:1px solid #c8963e44;border-radius:10px;padding:20px;text-align:center;margin-bottom:8px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#666666;text-transform:uppercase;">Kode Booking</p>
      <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:6px;color:#c8963e;font-family:monospace;">${b.code}</p>
    </div>

    <!-- Detail table -->
    ${buildBookingTable([
      { label: 'Paket Wisata', value: b.packageTitle },
      { label: 'Tanggal', value: b.date || '—' },
      { label: 'Jam Jemput', value: b.pickupTime ? b.pickupTime + ' WIB' : 'Akan dikonfirmasi' },
      { label: 'Titik Pickup', value: b.pickupName || '—' },
      { label: 'Jumlah Tamu', value: `${b.guests} orang` },
      { label: 'Total Pembayaran', value: b.totalUsd > 0 ? `$${b.totalUsd} USD` : 'Akan dikonfirmasi via WhatsApp' },
    ])}

    <!-- CTA -->
    ${buildCTAButton('Track Booking Kamu', trackUrl)}

    <p style="margin:16px 0 0;font-size:12px;color:#444444;text-align:center;">
      Atau kunjungi: <a href="${trackUrl}" style="color:#c8963e;text-decoration:none;">${trackUrl}</a>
    </p>
  `

  return {
    subject: `[Rehan Tour] Booking ${b.code} Berhasil Diterima — ${b.packageTitle}`,
    html: wrapLayout(inner),
  }
}

// ── Email: H-1 Reminder ───────────────────────────────────────────────────────

export function emailH1Reminder(b: {
  name: string
  code: string
  packageTitle: string
  date: string
  pickupTime: string
  pickupName: string
  driverName: string | null
  guests: number
}): { subject: string; html: string } {
  const trackUrl = `https://rehan-tour-travel-prototype.vercel.app/booking/${b.code}`
  const firstName = b.name.split(' ')[0]

  const inner = `
    <!-- Status badge -->
    <div style="text-align:center;margin-bottom:28px;">
      ${buildBadge('Reminder — Besok!', '#f59e0b')}
    </div>

    <!-- Greeting -->
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:300;color:#e8e4dc;letter-spacing:1px;text-align:center;">
      Siap Untuk Petualangan, ${firstName}?
    </h1>
    <p style="margin:0 0 32px;font-size:14px;color:#888888;text-align:center;line-height:1.6;">
      Trip kamu bersama Rehan Tour &amp; Travel <strong style="color:#f59e0b;">besok sudah menanti!</strong><br/>
      Pastikan kamu sudah siap dari semalam.
    </p>

    <!-- Booking code highlight -->
    <div style="background:linear-gradient(135deg,#1a1a1a,#141414);border:1px solid #c8963e44;border-radius:10px;padding:20px;text-align:center;margin-bottom:8px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#666666;text-transform:uppercase;">Kode Booking</p>
      <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:6px;color:#c8963e;font-family:monospace;">${b.code}</p>
    </div>

    <!-- Detail table -->
    ${buildBookingTable([
      { label: 'Paket Wisata', value: b.packageTitle },
      { label: 'Tanggal', value: b.date || '—' },
      { label: 'Jam Jemput', value: b.pickupTime ? b.pickupTime + ' WIB' : '—' },
      { label: 'Titik Pickup', value: b.pickupName || '—' },
      { label: 'Jumlah Tamu', value: `${b.guests} orang` },
      { label: 'Driver', value: b.driverName || 'Segera dikonfirmasi' },
    ])}

    <!-- Checklist -->
    <div style="background:#141414;border-radius:10px;padding:20px 24px;margin:24px 0;border-left:3px solid #c8963e;">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#c8963e;text-transform:uppercase;font-weight:600;">Checklist Persiapan</p>
      <table cellpadding="0" cellspacing="0" border="0">
        ${[
          ['Jaket tebal', 'Suhu gunung bisa 5–10°C di malam hari'],
          ['Sepatu tertutup', 'Nyaman untuk medan berbatu / tanah'],
          ['HP terisi penuh', 'Untuk komunikasi &amp; foto perjalanan'],
          ['Sarapan lebih awal', 'Sebelum jam jemput yang kamu pilih'],
          ['Air minum', 'Minimal 1 liter untuk perjalanan panjang'],
        ].map(([item, desc]) => `
        <tr>
          <td style="padding:5px 12px 5px 0;vertical-align:top;">
            <span style="display:inline-block;width:18px;height:18px;background:#c8963e22;border:1px solid #c8963e44;border-radius:3px;text-align:center;line-height:18px;font-size:11px;color:#c8963e;">&#10003;</span>
          </td>
          <td style="padding:5px 0;vertical-align:top;">
            <span style="font-size:13px;color:#e8e4dc;font-weight:600;">${item}</span>
            <span style="font-size:12px;color:#555555;margin-left:8px;">— ${desc}</span>
          </td>
        </tr>`).join('')}
      </table>
    </div>

    <!-- CTA -->
    ${buildCTAButton('Track Booking & Driver', trackUrl)}

    <p style="margin:16px 0 0;font-size:12px;color:#444444;text-align:center;">
      Pantau posisi driver secara live di: <a href="${trackUrl}" style="color:#c8963e;text-decoration:none;">${trackUrl}</a>
    </p>
  `

  return {
    subject: `[Rehan Tour] Reminder — Trip Kamu Besok, ${b.date}! Kode: ${b.code}`,
    html: wrapLayout(inner),
  }
}
