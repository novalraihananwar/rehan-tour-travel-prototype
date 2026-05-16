'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Phone, Edit3, Plus, CheckCircle, AlertCircle, Clock, Wrench, MapPin } from 'lucide-react'
import { fleetVehicles } from '@/lib/data'

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  Available: { label: 'Available', dot: 'bg-jungle-light', text: 'text-jungle-light', bg: 'bg-jungle/15', border: 'border-jungle/25' },
  Standby: { label: 'Standby', dot: 'bg-gold', text: 'text-gold', bg: 'bg-gold/15', border: 'border-gold/25' },
  'Fully Booked': { label: 'Fully Booked', dot: 'bg-lava', text: 'text-lava', bg: 'bg-lava/15', border: 'border-lava/25' },
  'On Trip': { label: 'On Trip', dot: 'bg-sunset', text: 'text-sunset', bg: 'bg-sunset/15', border: 'border-sunset/25' },
  Maintenance: { label: 'Maintenance', dot: 'bg-cream-muted', text: 'text-cream-muted', bg: 'bg-white/8', border: 'border-white/12' },
}

// Extend fleet with 30 simulated vehicles
const extendedFleet = [
  ...fleetVehicles,
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `RTT-${String(i + 9).padStart(3, '0')}`,
    plateNumber: i < 11 ? `L ${8009 + i} RTT` : `DK ${8001 + (i - 11)} RTT`,
    model: i % 3 === 0 ? 'Toyota HiAce Premio 2022' : i % 3 === 1 ? 'Toyota HiAce Commuter 2023' : 'Toyota HiAce Commuter 2022',
    capacity: i % 3 === 0 ? 11 : 13,
    driver: ['Andi Wijaya', 'Slamet Riyadi', 'Bagas Prabowo', 'Fajar Nugroho', 'Hendri Saputra', 'Irfan Maulana', 'Joko Santoso', 'Kukuh Prasetyo', 'Lukman Hakim', 'Mulyadi Susanto', 'Niko Firmansyah', 'Otto Kurniawan', 'Putu Agus', 'Raka Sanjaya', 'Satria Kusuma', 'Tomi Wibowo', 'Umar Basri', 'Vino Ramadhan', 'Widi Santoso', 'Xander Pratama', 'Yogi Haryanto', 'Zaki Firdaus'][i],
    driverPhone: `+62812-${String(4567890 + i).substring(0, 7)}`,
    status: (['Available', 'Available', 'On Trip', 'Standby', 'Available', 'Fully Booked', 'Available', 'On Trip', 'Available', 'Available', 'Standby', 'Available', 'On Trip', 'Available', 'Available', 'Fully Booked', 'Available', 'On Trip', 'Available', 'Maintenance', 'Available', 'Standby'] as const)[i],
    currentRoute: i % 3 === 2 ? ['Malang → Bromo', 'Bali Circuit', 'Surabaya → Ijen', 'Bromo → Banyuwangi', 'Ubud → Kintamani', 'Seminyak → Nusa Penida'][i % 6] : undefined,
    nextTrip: '2026-05-25',
    occupancy: i % 3 === 2 ? ((i * 7 + 3) % 8) + 4 : 0,
    totalTrips: ((i * 31 + 47) % 300) + 50,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80',
  })),
]

export default function FleetPage() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('table')

  const statusCounts = extendedFleet.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const filtered = extendedFleet.filter((v) => {
    const matchStatus = statusFilter === 'All' || v.status === statusFilter
    const matchSearch = !search || v.id.toLowerCase().includes(search.toLowerCase()) || v.driver.toLowerCase().includes(search.toLowerCase()) || v.plateNumber.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">Fleet & Drivers</h1>
          <p className="text-sm text-cream-muted mt-0.5">30 Toyota HiAce vehicles — {statusCounts['On Trip'] || 0} currently on trip</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-volcanic bg-sunset-gradient hover:shadow-glow-sunset hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <motion.button
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className={`glass-card rounded-2xl p-4 text-center transition-all duration-200 cursor-pointer ${statusFilter === status ? `border-current ${cfg.text}` : 'hover:border-white/12'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} mx-auto mb-2`} />
            <div className={`text-2xl font-bold font-display ${cfg.text}`}>{statusCounts[status] || 0}</div>
            <div className="text-xs text-cream-muted mt-1">{cfg.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle ID, driver name, plate..."
            className="input-dark pl-9 text-sm py-2.5 w-full"
          />
        </div>
        <div className="flex border border-white/10 rounded-xl overflow-hidden">
          <button onClick={() => setView('table')} className={`px-4 py-2.5 text-xs font-medium transition-colors ${view === 'table' ? 'bg-sunset/20 text-sunset' : 'text-cream-muted hover:text-cream'}`}>
            Table
          </button>
          <button onClick={() => setView('grid')} className={`px-4 py-2.5 text-xs font-medium transition-colors ${view === 'grid' ? 'bg-sunset/20 text-sunset' : 'text-cream-muted hover:text-cream'}`}>
            Cards
          </button>
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6">
                  {['Vehicle ID', 'Plate', 'Model / Cap', 'Driver', 'Phone', 'Status', 'Current Route', 'Occupancy', 'Total Trips', ''].map((h) => (
                    <th key={h} className="text-left py-3.5 px-4 text-cream-muted uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const cfg = statusConfig[v.status]
                  return (
                    <tr key={v.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cream">{v.id}</td>
                      <td className="py-3 px-4 font-mono text-cream-muted text-xs">{v.plateNumber}</td>
                      <td className="py-3 px-4">
                        <div className="text-cream">{v.model.replace('Toyota HiAce ', '').split(' ')[0]}</div>
                        <div className="text-cream-muted">{v.capacity} pax</div>
                      </td>
                      <td className="py-3 px-4 text-cream">{v.driver}</td>
                      <td className="py-3 px-4 text-cream-muted">{v.driverPhone}</td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full border text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${v.status === 'On Trip' ? 'animate-pulse' : ''}`} />
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cream-muted">{v.currentRoute || '—'}</td>
                      <td className="py-3 px-4">
                        {v.status === 'On Trip' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-volcanic-500 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-gradient-to-r from-sunset to-gold" style={{ width: `${(v.occupancy / v.capacity) * 100}%` }} />
                            </div>
                            <span className="text-sunset">{v.occupancy}/{v.capacity}</span>
                          </div>
                        ) : <span className="text-cream-muted">—</span>}
                      </td>
                      <td className="py-3 px-4 text-sunset font-medium">{v.totalTrips}</td>
                      <td className="py-3 px-4">
                        <button className="p-1.5 rounded-lg hover:bg-white/8 text-cream-muted hover:text-cream transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => {
            const cfg = statusConfig[v.status]
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl overflow-hidden hover:border-sunset/20 transition-all duration-300"
              >
                <div className="relative h-32 bg-volcanic-400 flex items-center justify-center">
                  <Truck className="w-14 h-14 text-volcanic-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic-300 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium backdrop-blur-sm ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {v.status}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 font-mono text-xs text-cream-muted bg-volcanic/70 backdrop-blur-sm px-2 py-0.5 rounded">
                    {v.id}
                  </div>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="font-mono text-cream-muted">{v.plateNumber}</div>
                  <div className="text-sm font-medium text-cream">{v.driver}</div>
                  <div className="text-cream-muted">{v.model.replace('Toyota HiAce ', '')}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-cream-muted flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {v.driverPhone}
                    </span>
                    <span className="text-sunset font-medium">{v.totalTrips} trips</span>
                  </div>
                  {v.currentRoute && (
                    <div className="flex items-center gap-1 text-sunset text-xs">
                      <MapPin className="w-3 h-3" /> {v.currentRoute}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-cream-muted text-center">
        Showing {filtered.length} of {extendedFleet.length} vehicles
      </p>
    </div>
  )
}
