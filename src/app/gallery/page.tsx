'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, MapPin } from 'lucide-react'

const photos = [
  { id: 1, src: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=800&q=80', cat: 'Bromo', title: 'Bromo Sunrise', loc: 'Mount Bromo, East Java' },
  { id: 2, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', cat: 'Bromo', title: 'Sea of Sand', loc: 'Bromo Tengger Semeru NP' },
  { id: 3, src: 'https://images.unsplash.com/photo-1562801756-23d4f2b3e03e?w=800&q=80', cat: 'Ijen', title: 'Blue Fire Phenomenon', loc: 'Ijen Crater, Banyuwangi' },
  { id: 4, src: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80', cat: 'Ijen', title: 'Turquoise Acid Lake', loc: 'Kawah Ijen, East Java' },
  { id: 5, src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', cat: 'Bali', title: 'Ubud Rice Terraces', loc: 'Tegalalang, Ubud, Bali' },
  { id: 6, src: 'https://images.unsplash.com/photo-1544085311-11a028465b03?w=800&q=80', cat: 'Bali', title: 'Uluwatu Temple Sunset', loc: 'Uluwatu, Bali' },
  { id: 7, src: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80', cat: 'Tumpak Sewu', title: 'Hidden Waterfall', loc: 'Tumpak Sewu, Lumajang' },
  { id: 8, src: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80', cat: 'Bali', title: 'Tegalalang Sunrise', loc: 'Tegalalang, Bali' },
  { id: 9, src: 'https://images.unsplash.com/photo-1560853980-94d8e2d4b5ab?w=800&q=80', cat: 'Culture', title: 'Kecak Dance', loc: 'Pura Luhur Uluwatu, Bali' },
  { id: 10, src: 'https://images.unsplash.com/photo-1544547500-74b3c14f0f80?w=800&q=80', cat: 'Bali', title: 'Nusa Penida Cliffs', loc: 'Nusa Penida, Bali' },
  { id: 11, src: 'https://images.unsplash.com/photo-1591017403997-bfd4a48fe72e?w=800&q=80', cat: 'Wildlife', title: 'Balinese Monkey Forest', loc: 'Sacred Monkey Forest, Ubud' },
  { id: 12, src: 'https://images.unsplash.com/photo-1571406252241-db0280bd36cd?w=800&q=80', cat: 'Bromo', title: 'Volcanic Crater Edge', loc: 'Mount Bromo, East Java' },
  { id: 13, src: 'https://images.unsplash.com/photo-1604998103924-089f5b398f35?w=800&q=80', cat: 'Culture', title: 'Tanah Lot Temple', loc: 'Tabanan, Bali' },
  { id: 14, src: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&q=80', cat: 'Bali', title: 'Bali Canggu Beach', loc: 'Canggu, Bali' },
  { id: 15, src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80', cat: 'Tumpak Sewu', title: 'Waterfall Valley', loc: 'Tumpak Sewu, Lumajang' },
  { id: 16, src: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=800&q=80', cat: 'Bromo', title: 'Bromo Caldera', loc: 'Bromo Tengger Semeru NP' },
  { id: 17, src: 'https://images.unsplash.com/photo-1553697388-94e804e2f0f6?w=800&q=80', cat: 'Culture', title: 'Barong Dance', loc: 'Batubulan, Bali' },
  { id: 18, src: 'https://images.unsplash.com/photo-1531219572328-a0171b4448a3?w=800&q=80', cat: 'Wildlife', title: 'Komodo Dragon', loc: 'Komodo Island, NTT' },
  { id: 19, src: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800&q=80', cat: 'Bali', title: 'Kintamani Volcano', loc: 'Kintamani, Bali' },
  { id: 20, src: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80', cat: 'Ijen', title: 'Ijen Sunrise Trek', loc: 'Banyuwangi, East Java' },
  { id: 21, src: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', cat: 'Bali', title: 'Sacred Tirta Empul', loc: 'Tampaksiring, Bali' },
  { id: 22, src: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80', cat: 'Tumpak Sewu', title: 'Cascading Falls', loc: 'Coban Sewu, East Java' },
  { id: 23, src: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80', cat: 'Wildlife', title: 'Tropical Birdlife', loc: 'Bali Bird Park' },
  { id: 24, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', cat: 'Bromo', title: 'Jeep Safari', loc: 'Mount Bromo, East Java' },
]

const categories = ['All', 'Bromo', 'Ijen', 'Tumpak Sewu', 'Bali', 'Wildlife', 'Culture']

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<typeof photos[0] | null>(null)

  const filtered = activeCategory === 'All' ? photos : photos.filter(p => p.cat === activeCategory)

  return (
    <div className="min-h-screen bg-volcanic pt-20">
      {/* Header */}
      <section className="py-20 border-b border-white/6">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-xs text-sunset tracking-widest uppercase mb-3">Visual Journey</p>
            <h1 className="font-display text-5xl sm:text-6xl text-cream mb-6">Gallery</h1>
            <p className="text-cream-muted text-lg max-w-2xl">A glimpse into the raw beauty of East Java and Bali — captured on our tours.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-sunset text-volcanic' : 'border border-white/15 text-cream-muted hover:text-cream hover:border-sunset/40'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {filtered.map((photo, i) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="break-inside-avoid cursor-pointer group relative rounded-2xl overflow-hidden"
                onClick={() => setLightbox(photo)}
              >
                <img src={photo.src} alt={photo.title} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-cream text-sm font-medium">{photo.title}</p>
                    <p className="text-cream-muted text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{photo.loc}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-cream" />
                  </div>
                </div>
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/50 text-cream text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.cat}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-cream transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.src.replace('w=800', 'w=1200')} alt={lightbox.title} className="w-full max-h-[75vh] object-contain rounded-2xl" />
              <div className="mt-3 text-center">
                <p className="text-cream font-medium">{lightbox.title}</p>
                <p className="text-cream-muted text-sm flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />{lightbox.loc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
