import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Rehan Tour & Travel',
}

const sections = [
  {
    title: '1. Booking & Confirmation',
    content: `To confirm a booking, a deposit of 30% of the total tour price is required. The remaining balance is due no later than 3 days before the departure date. Bookings are considered confirmed only after we have received the deposit and sent a written confirmation via WhatsApp or email.

    All bookings are subject to availability. Rehan Tour & Travel reserves the right to refuse bookings at our discretion.`,
  },
  {
    title: '2. Payment',
    content: `We accept payments via bank transfer (BCA, Mandiri, BRI), QRIS, PayPal, and Xendit. All prices are quoted in USD unless stated otherwise. Currency conversion charges, bank fees, and transaction costs are the responsibility of the customer.

    For group bookings of 8 or more travelers, special payment arrangements may be negotiated directly with our team.`,
  },
  {
    title: '3. Cancellation & Refund Policy',
    content: `• Cancellation 72+ hours before departure: Full refund of deposit paid
    • Cancellation 24-72 hours before departure: 50% refund of total tour price
    • Cancellation within 24 hours of departure: No refund
    • No-show: No refund

    Rescheduling requests made 48+ hours before departure are accommodated free of charge, subject to availability. Rescheduling within 48 hours incurs a 20% administrative fee.

    Rehan Tour & Travel reserves the right to cancel or reschedule tours due to extreme weather, volcanic activity, natural disasters, or government restrictions. In such cases, full refunds will be issued.`,
  },
  {
    title: '4. Tour Inclusions & Exclusions',
    content: `Tour prices include: transportation throughout the itinerary, English-speaking guide, entrance fees to attractions listed in the package, and hotel/airport pickup and drop-off.

    Unless explicitly stated in the package description, tour prices do not include: accommodation, meals, personal travel insurance, tips for guides and drivers, personal expenses, visa fees, or any services not mentioned in the itinerary.`,
  },
  {
    title: '5. Health & Medical Requirements',
    content: `Some tours involve strenuous physical activity including hiking, early morning starts, and exposure to volcanic gases (at Ijen Crater). Participants should be in good physical health.

    Travelers with respiratory conditions, heart problems, pregnancy, or mobility limitations should consult a medical professional before booking volcano tours. Rehan Tour & Travel is not liable for health incidents arising from pre-existing conditions.

    Gas masks are provided for Ijen Blue Fire tours.`,
  },
  {
    title: '6. Liability',
    content: `Rehan Tour & Travel operates with professional drivers holding valid commercial licenses, well-maintained vehicles, and experienced guides. However, we cannot guarantee a risk-free environment in natural settings.

    Rehan Tour & Travel is not liable for: personal injury or death from participants' own actions, loss or damage to personal belongings, delays caused by traffic, weather, or force majeure events, or costs arising from medical emergencies.

    We strongly recommend that all travelers obtain comprehensive travel insurance covering medical evacuation, cancellation, and baggage loss before departure.`,
  },
  {
    title: '7. Behavior & Code of Conduct',
    content: `Travelers are expected to behave respectfully toward local communities, sacred sites, wildlife, and other travelers. Illegal behavior, substance abuse, or conduct that endangers others will result in immediate removal from the tour without refund.

    Photography of sacred ceremonies requires permission from local authorities. Our guides will advise on appropriate conduct at each site.`,
  },
  {
    title: '8. Force Majeure',
    content: `Rehan Tour & Travel is not responsible for failure to perform obligations when prevented by circumstances beyond our reasonable control including natural disasters, volcanic eruptions, government travel restrictions, pandemics, civil unrest, or other Acts of God.

    In force majeure situations, we will offer rescheduling or tour credit. Cash refunds in force majeure situations are assessed case-by-case.`,
  },
  {
    title: '9. Intellectual Property',
    content: `All content on our website including text, photos, videos, and branding is the property of Rehan Tour & Travel. Unauthorized reproduction, redistribution, or commercial use without written permission is prohibited.`,
  },
  {
    title: '10. Governing Law',
    content: `These Terms & Conditions are governed by the laws of the Republic of Indonesia. Any disputes shall be resolved through good-faith negotiation and, if necessary, through the courts of Surabaya, East Java, Indonesia.

    By booking with Rehan Tour & Travel, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-volcanic pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <p className="text-xs text-sunset tracking-widest uppercase mb-3">Legal</p>
          <h1 className="font-display text-5xl text-cream mb-4">Terms & Conditions</h1>
          <p className="text-cream-muted text-sm">Last updated: January 2025 · Effective date: January 1, 2025</p>
          <p className="text-cream-muted mt-4 leading-relaxed">
            By booking a tour with Rehan Tour & Travel, you agree to these terms and conditions. Please read them carefully before making a reservation.
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
          <h3 className="font-display text-lg text-cream mb-2">Questions about these terms?</h3>
          <p className="text-cream-muted text-sm mb-4">Contact us at <a href="mailto:info@rehantour.id" className="text-sunset hover:underline">info@rehantour.id</a> or via WhatsApp at +62 812-3456-7890.</p>
        </div>
      </div>
    </div>
  )
}
