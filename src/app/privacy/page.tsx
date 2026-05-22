import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Rehan Tour & Travel',
}

const sections = [
  {
    title: '1. Information We Collect',
    content: `When you book a tour or contact us, we collect:

    • Personal information: full name, email address, WhatsApp/phone number
    • Booking details: tour package, travel dates, group size, pickup location, special requests
    • Payment information: payment method (we do not store card numbers — payment is processed by our payment providers)
    • Communication records: messages sent via WhatsApp, email, or our contact form
    • Device information: IP address, browser type, and usage data collected automatically when you visit our website`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use collected information to:

    • Process and confirm your tour booking
    • Send booking confirmations, itineraries, and reminders via WhatsApp and email
    • Coordinate pickup, transportation, and tour logistics
    • Respond to inquiries and provide customer support
    • Send important updates about your upcoming tour
    • Improve our services and website experience
    • Comply with legal obligations

    We do not use your information for unsolicited marketing without your consent.`,
  },
  {
    title: '3. Information Sharing',
    content: `We share your information only with:

    • Tour guides and drivers involved in your specific trip (name, pickup location, tour details only)
    • Payment processors (Xendit, PayPal) — subject to their privacy policies
    • Supabase (our secure database provider) — for data storage
    • WhatsApp/Meta and email providers — for sending confirmations
    • Government authorities — when required by law

    We do not sell, rent, or trade your personal data to third parties for marketing purposes.`,
  },
  {
    title: '4. Data Storage & Security',
    content: `Your data is stored on secure servers provided by Supabase (hosted in Asia-Pacific regions). We implement industry-standard security measures including:

    • Encrypted data transmission (HTTPS/TLS)
    • Row-level security on our database
    • Access controls limiting staff access to data on a need-to-know basis

    No method of data transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    title: '5. Data Retention',
    content: `We retain your personal data for:

    • Active bookings: duration of tour + 90 days
    • Completed bookings: up to 3 years for accounting and legal compliance
    • Marketing communications: until you unsubscribe
    • Website analytics: up to 26 months

    You may request deletion of your data at any time (see Section 7).`,
  },
  {
    title: '6. Cookies & Analytics',
    content: `Our website uses minimal cookies for:

    • Essential functionality (language preferences, booking session state)
    • Anonymous analytics to understand how visitors use our site

    We do not use invasive tracking or third-party advertising cookies. You can disable cookies in your browser settings, though this may affect website functionality.`,
  },
  {
    title: '7. Your Rights (GDPR & Indonesian Law)',
    content: `Under applicable privacy laws, you have the right to:

    • Access: Request a copy of the personal data we hold about you
    • Correction: Request correction of inaccurate or incomplete data
    • Deletion: Request deletion of your personal data ("right to be forgotten")
    • Portability: Request your data in a structured, machine-readable format
    • Restriction: Request that we limit processing of your data
    • Objection: Object to processing of your data for marketing purposes
    • Withdraw consent: Withdraw any previously given consent at any time

    To exercise these rights, contact us at info@rehantour.id. We will respond within 30 days.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy periodically. Material changes will be communicated via email or prominent notice on our website. Continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact & Data Controller',
    content: `Rehan Tour & Travel acts as data controller for information processed under this policy.

    For privacy inquiries or to exercise your rights:
    Email: info@rehantour.id
    WhatsApp: +62 812-3456-7890
    Address: Jl. Raya Bromo No.1, Surabaya, East Java 60271, Indonesia`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-volcanic pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <p className="text-xs text-sunset tracking-widest uppercase mb-3">Legal</p>
          <h1 className="font-display text-5xl text-cream mb-4">Privacy Policy</h1>
          <p className="text-cream-muted text-sm">Last updated: January 2025 · Effective date: January 1, 2025</p>
          <p className="text-cream-muted mt-4 leading-relaxed">
            Rehan Tour & Travel is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding your personal information.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map(section => (
            <div key={section.title} className="border-t border-white/8 pt-8">
              <h2 className="font-display text-xl text-cream mb-4">{section.title}</h2>
              <div className="text-cream-muted text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 glass-card rounded-2xl p-6 border-sunset/20">
          <h3 className="font-display text-lg text-cream mb-2">Privacy Questions?</h3>
          <p className="text-cream-muted text-sm">
            Contact our data team at{' '}
            <a href="mailto:info@rehantour.id" className="text-sunset hover:underline">info@rehantour.id</a>
            {' '}or WhatsApp +62 812-3456-7890. We respond within 2 business days.
          </p>
        </div>
      </div>
    </div>
  )
}
