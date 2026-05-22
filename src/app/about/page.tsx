'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Heart, Star, Users, MapPin, Award, ArrowRight } from 'lucide-react'

const teamMembers = [
  { name: 'Rehan Pratama', role: 'Founder & Lead Guide', bio: '10+ years exploring East Java and Bali. Expert in volcanic routes and cultural experiences.', avatar: 'https://ui-avatars.com/api/?name=RP&background=E8703A&color=0A0A0A&bold=true&size=120&format=png' },
  { name: 'Andi Setiawan', role: 'Senior Driver & Guide', bio: 'Born in Malang, knows every backroad to Bromo and Ijen. 8 years with the team.', avatar: 'https://ui-avatars.com/api/?name=AS&background=D4A843&color=0A0A0A&bold=true&size=120&format=png' },
  { name: 'Budi Hartono', role: 'Bali Specialist', bio: 'Bali native with deep knowledge of local temples, culture, and hidden beaches.', avatar: 'https://ui-avatars.com/api/?name=BH&background=2D6A4F&color=F0E6D6&bold=true&size=120&format=png' },
  { name: 'Dewi Rahayu', role: 'Customer Experience', bio: 'Fluent in English & Japanese. Ensures every traveler feels at home from first contact.', avatar: 'https://ui-avatars.com/api/?name=DR&background=1E6FAF&color=F0E6D6&bold=true&size=120&format=png' },
]

const values = [
  { icon: Shield, title: 'Safety First', desc: 'All vehicles maintained weekly. Every route risk-assessed. Your safety is non-negotiable.', color: 'text-jungle-light' },
  { icon: Heart, title: 'Authentic Experiences', desc: 'No tourist traps. We take you where locals go — the real East Java and Bali.', color: 'text-sunset' },
  { icon: Star, title: 'Excellence', desc: 'Premium Toyota HiAce fleet. Cinematic photography spots. Memories that last forever.', color: 'text-gold' },
]

const stats = [
  { num: '500+', label: 'Happy Travelers' },
  { num: '8', label: 'Tour Packages' },
  { num: '12', label: 'Destinations' },
  { num: '5+', label: 'Years Experience' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-volcanic pt-20">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1400&q=80" alt="Mount Bromo" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-volcanic/50 via-transparent to-volcanic" />
        </div>
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-xs text-sunset tracking-widest uppercase mb-3">Our Story</p>
            <h1 className="font-display text-5xl sm:text-6xl text-cream mb-6 leading-tight">
              About Rehan<br />Tour & Travel
            </h1>
            <p className="text-cream-muted text-lg max-w-2xl leading-relaxed">
              Born from a deep love for East Java&apos;s volcanic landscapes and Bali&apos;s timeless culture. We don&apos;t just drive you to destinations — we craft cinematic journeys you&apos;ll tell stories about for years.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/6">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="font-display text-4xl text-sunset mb-1">{s.num}</p>
                <p className="text-sm text-cream-muted">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-xs text-gold tracking-widest uppercase mb-3">Our Story</p>
              <h2 className="font-display text-4xl text-cream mb-6">From Surabaya,<br />to the World</h2>
              <div className="space-y-4 text-cream-muted leading-relaxed">
                <p>Rehan Tour & Travel started in 2018 with a single Toyota HiAce and one mission: to show international travelers the real beauty of East Java — not through a tourist lens, but through the eyes of someone who grew up loving these mountains.</p>
                <p>Our founder, Rehan Pratama, spent years as a local guide before building a proper fleet of 30 vehicles. Every driver on our team is a storyteller, every route is curated for maximum wonder, and every trip is designed as a cinematic experience.</p>
                <p>Today, we take travelers from Surabaya to Bali on overland adventures that include Bromo&apos;s sunrise sea of sand, Ijen&apos;s electric blue fire, Tumpak Sewu&apos;s hidden waterfall, and Bali&apos;s cultural heart. All door-to-door, all in comfort.</p>
              </div>
              <Link href="/booking" className="btn-primary inline-flex items-center gap-2 mt-8 px-6 py-3">
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
              <div className="relative h-[500px] rounded-3xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1531219572328-a0171b4448a3?w=800&q=80" alt="Team in East Java" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic/50 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sunset/20 flex items-center justify-center"><MapPin className="w-5 h-5 text-sunset" /></div>
                <div>
                  <p className="text-xs text-cream-muted">Based in</p>
                  <p className="text-sm font-medium text-cream">Surabaya, East Java</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-volcanic-200/30">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs text-gold tracking-widest uppercase mb-3">What We Stand For</p>
            <h2 className="font-display text-4xl text-cream">Our Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 hover:border-sunset/20 transition-all">
                <v.icon className={`w-8 h-8 ${v.color} mb-5`} />
                <h3 className="font-display text-xl text-cream mb-3">{v.title}</h3>
                <p className="text-cream-muted text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs text-sunset tracking-widest uppercase mb-3">The People Behind</p>
            <h2 className="font-display text-4xl text-cream">Our Team</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center hover:border-sunset/20 transition-all">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-sunset/30">
                  <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium text-cream text-sm mb-0.5">{m.name}</h3>
                <p className="text-xs text-sunset mb-3">{m.role}</p>
                <p className="text-xs text-cream-muted leading-relaxed">{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/6">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Award className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-display text-4xl text-cream mb-4">Ready to Explore?</h2>
            <p className="text-cream-muted mb-8 max-w-xl mx-auto">Join 500+ travelers who&apos;ve experienced East Java and Bali the Rehan way. No shortcuts — just unforgettable journeys.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/packages" className="btn-primary px-8 py-3">View Packages</Link>
              <Link href="/contact" className="btn-ghost px-8 py-3">Contact Us</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
