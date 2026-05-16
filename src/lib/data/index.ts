export interface Destination {
  id: string
  slug: string
  name: string
  region: 'east-java' | 'bali'
  tagline: string
  description: string
  longDescription: string
  image: string
  heroImage: string
  category: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  duration: string
  bestSeason: string
  elevation?: string
  highlights: string[]
  hiddenGems: string[]
  localFood: string[]
  nearbyPlaces: string[]
  estimatedBudget: { min: number; max: number; currency: string }
  weather: { temp: string; condition: string; humidity: string }
  coordinates: { lat: number; lng: number }
  featured: boolean
}

export interface TourPackage {
  id: string
  slug: string
  title: string
  subtitle: string
  coverImage: string
  duration: string
  durationDays: number
  price: { usd: number; idr: number }
  originalPrice?: { usd: number; idr: number }
  maxGroupSize: number
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  type: 'shared' | 'private' | 'luxury' | 'honeymoon'
  category: string[]
  highlights: string[]
  included: string[]
  excluded: string[]
  itinerary: ItineraryDay[]
  pickupPoints: string[]
  availableSeats: number
  totalSeats: number
  nextDeparture: string
  rating: number
  reviewCount: number
  featured: boolean
  tags: string[]
  distance: string
  routeDescription: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  meals: string[]
  accommodation: string
  image?: string
}

export interface Vehicle {
  id: string
  plateNumber: string
  model: string
  capacity: number
  driver: string
  driverPhone: string
  status: 'Available' | 'Standby' | 'Fully Booked' | 'On Trip' | 'Maintenance'
  currentRoute?: string
  nextTrip?: string
  occupancy: number
  maintenanceDate?: string
  totalTrips: number
  image: string
}

export interface Testimonial {
  id: string
  name: string
  country: string
  flag: string
  avatar: string
  rating: number
  review: string
  package: string
  date: string
  verified: boolean
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  author: string
  authorAvatar: string
  publishedAt: string
  readTime: string
  tags: string[]
  featured: boolean
}

export interface PickupPoint {
  id: string
  city: string
  region: 'surabaya' | 'malang' | 'banyuwangi' | 'bali'
  name: string
  address: string
  additionalFee: number
  meetingTime: string
  landmark: string
  coordinates: { lat: number; lng: number }
}

// ─── DESTINATIONS ─────────────────────────────────────────────────────────────

export const destinations: Destination[] = [
  {
    id: 'bromo',
    slug: 'mount-bromo',
    name: 'Mount Bromo',
    region: 'east-java',
    tagline: 'Sunrise over the world\'s most dramatic caldera',
    description: 'An active volcano rising from a 10km sea of volcanic sand. The pre-dawn jeep ride and crater-rim walk deliver one of Southeast Asia\'s most unforgettable mornings.',
    longDescription: 'Mount Bromo (2,329 m) sits inside the vast Tengger Caldera alongside three other peaks — a landscape so alien it feels like another planet. The pre-dawn journey begins at 3 am: a 4WD jeep across the sand sea, a short steep climb to Penanjakan viewpoint, then sunrise erupting over the smoking crater at around 5:30 am. Afterwards you descend to the caldera floor and hike or ride horseback to the crater rim, peering into the steaming abyss. The surrounding Teletubbies Hill and savannah extend the experience well beyond the sunrise itself.',
    image: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1920&q=85',
    category: 'Volcano',
    difficulty: 'Moderate',
    duration: '1–2 days',
    bestSeason: 'April – October',
    elevation: '2,329 m',
    highlights: [
      'Penanjakan Sunrise Viewpoint (4,200 ft)',
      '4WD Jeep across the volcanic sand sea',
      'Crater rim walk above the smoking vent',
      'Teletubbies Hill golden grasslands',
      'Bromo Savannah at golden hour',
    ],
    hiddenGems: [
      'Bukit Cinta (Love Hill) — fewer crowds, equally stunning view',
      'Cemoro Lawang village — Tenggerese morning market at 4 am',
      'Padang Savanna dusk walk — best light at 5 pm',
      'Madakaripura waterfall (45 min away) — often combined same day',
    ],
    localFood: [
      'Rawon — black beef soup from Probolinggo',
      'Nasi Pecel — peanut-sauce rice platter',
      'Jagung Bakar — grilled corn at crater base',
      'Susu Sapi Segar — fresh warm milk from Tengger farms',
    ],
    nearbyPlaces: [
      'Madakaripura Waterfall — 45 min drive',
      'Tumpak Sewu Waterfall — 2.5 hrs drive',
      'Malang City — 2.5 hrs drive',
    ],
    estimatedBudget: { min: 45, max: 110, currency: 'USD' },
    weather: { temp: '3–18°C at summit', condition: 'Cool, misty dawn', humidity: '65–80%' },
    coordinates: { lat: -7.9425, lng: 112.9530 },
    featured: true,
  },
  {
    id: 'tumpak-sewu',
    slug: 'tumpak-sewu-waterfall',
    name: 'Tumpak Sewu',
    region: 'east-java',
    tagline: 'A 120-metre horseshoe of water you walk behind',
    description: 'Java\'s most spectacular waterfall — a wide curtain of cascades tumbling into a deep jungle canyon. The descent to the canyon floor is an adventure in itself.',
    longDescription: 'Tumpak Sewu ("a thousand waterfalls") is 120 metres tall and almost as wide, forming a near-complete horseshoe. From the cliff viewpoint the scale is overwhelming — but the real magic is the 45-minute guided descent into the canyon via fixed ropes and steep jungle paths. At the base you can walk directly behind the curtain of water, surrounded by moss, ferns, and thunder. Nearby Goa Tetes cave adds a mystic underground dimension to the visit. The waterfall runs year-round but peaks in the wet season (Nov–May) when multiple subsidiary falls join the main drop.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=85',
    category: 'Waterfall',
    difficulty: 'Challenging',
    duration: '1 full day',
    bestSeason: 'November – May (peak flow)',
    highlights: [
      'Panoramic clifftop viewpoint',
      'Guided canyon descent via fixed ropes',
      'Walk behind the waterfall curtain',
      'Goa Tetes limestone cave system',
      'Multiple subsidiary waterfalls at base',
    ],
    hiddenGems: [
      'Upper platform at sunrise — golden mist before tourist crowds',
      'Secret river pools 10 min upstream',
      'Pronojiwo village homestays — authentic Javanese rural life',
      'Durian season stalls (January–February)',
    ],
    localFood: [
      'Soto Ayam Lamongan — chicken soup roadside stops',
      'Kelapa Muda — fresh coconut at the trailhead',
      'Durian Lokal — notoriously strong, locally prized (seasonal)',
    ],
    nearbyPlaces: [
      'Mount Bromo — 2.5 hrs north',
      'Malang City — 3 hrs north',
      'Ijen Crater — 4 hrs east',
    ],
    estimatedBudget: { min: 25, max: 60, currency: 'USD' },
    weather: { temp: '20–28°C', condition: 'Humid tropical', humidity: '78–92%' },
    coordinates: { lat: -8.2325, lng: 112.9168 },
    featured: true,
  },
  {
    id: 'ijen',
    slug: 'ijen-crater',
    name: 'Kawah Ijen',
    region: 'east-java',
    tagline: 'Blue fire at midnight — Earth\'s rarest natural phenomenon',
    description: 'The world\'s largest acidic volcanic lake glows turquoise by day. Before dawn, electric-blue flames — burning sulfuric gas — erupt from fissures in the crater floor.',
    longDescription: 'Kawah Ijen (2,799 m) is a twin spectacle: the blue fire (api biru) before dawn, and the impossibly turquoise-green crater lake by sunrise. The blue fire is produced by liquid sulfur catching alight — one of only two places on Earth where this occurs. The midnight hike (3 km, ~1.5 hrs uphill) leads through sulfur-scented air to the crater rim, then down to the lake shore where miners still carry 80 kg loads of yellow sulfur out daily — a humbling sight. Sunrise over the lake turns the steam orange and gold.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
    category: 'Volcano',
    difficulty: 'Challenging',
    duration: '1 day (depart midnight)',
    bestSeason: 'April – October (dry season)',
    elevation: '2,799 m',
    highlights: [
      'Blue fire phenomenon — visible midnight to 4 am only',
      'Turquoise acidic crater lake (pH 0.5)',
      'Sulfur miner community — witness a dying tradition',
      'Sunrise colours over the crater',
      'Paltuding basecamp panoramic view',
    ],
    hiddenGems: [
      'Sulfur crystal sculptures sold by miners at the crater',
      'Banyuwangi coffee plantations en route (Kopi Osing)',
      'Jambu village morning market after descent',
      'Baluran National Park day-add (1.5 hrs away)',
    ],
    localFood: [
      'Nasi Bungkus — wrapped rice meals for the hike',
      'Kopi Osing — Banyuwangi\'s aromatic local robusta',
      'Rujak Soto — a Banyuwangi signature fruit-and-broth dish',
    ],
    nearbyPlaces: [
      'Banyuwangi City — 1.5 hrs (ferry to Bali here)',
      'Baluran National Park — 1.5 hrs ("Africa of Java")',
      'Ketapang Ferry Terminal — 2 hrs',
    ],
    estimatedBudget: { min: 35, max: 75, currency: 'USD' },
    weather: { temp: '2–14°C at crater rim', condition: 'Cold, sulfuric overnight', humidity: '72–86%' },
    coordinates: { lat: -8.0584, lng: 114.2422 },
    featured: true,
  },
  {
    id: 'malang',
    slug: 'malang',
    name: 'Malang',
    region: 'east-java',
    tagline: 'Java\'s coolest highland city — colonial streets & volcanic views',
    description: 'At 450 m elevation, Malang enjoys year-round spring weather. Colonial architecture, colourful painted kampungs, and the cool highlands of Batu make it East Java\'s most liveable base.',
    longDescription: 'Malang sits in a fertile valley ringed by five volcanoes. Dutch colonial boulevards meet Instagram-famous rainbow villages. The neighbouring hill town Batu houses Museum Angkut (Southeast Asia\'s best vehicle museum) and Batu Night Spectacular. Coban Rondo waterfall and apple orchards lie 30 minutes outside town. Malang is the ideal multi-day base before heading to Bromo or Tumpak Sewu.',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1920&q=85',
    category: 'City',
    difficulty: 'Easy',
    duration: '2–3 days',
    bestSeason: 'Year-round (coolest June–August)',
    highlights: [
      'Jodipan & Ksatrian — the original kampung warna-warni',
      'Museum Angkut — vintage vehicles across 6 themed zones',
      'Batu Night Spectacular — illuminated park after dark',
      'Singosari Temple — 13th-century Hindu kingdom ruins',
      'Alun-Alun Malang — the colonial town square',
    ],
    hiddenGems: [
      'Secret Garden Village Batu — floating flower market',
      'Coban Rondo Waterfall — accessible, less visited than Tumpak Sewu',
      'Pasar Besar morning food market — best noodles at 6 am',
      'Omah Kayu treehouse — jungle glamping above Batu',
    ],
    localFood: [
      'Bakso Malang — the city\'s legendary hand-pressed meatball soup',
      'Soto Malang — clear aromatic chicken broth',
      'Nasi Goreng Jawa Klasik — fried rice with kretek smokiness',
      'Apel Malang — crisp local apples from Batu orchards',
    ],
    nearbyPlaces: [
      'Mount Bromo — 2.5 hrs east',
      'Tumpak Sewu — 3 hrs south',
      'Sempu Island — 3.5 hrs south',
    ],
    estimatedBudget: { min: 20, max: 65, currency: 'USD' },
    weather: { temp: '18–28°C', condition: 'Highland spring', humidity: '62–78%' },
    coordinates: { lat: -7.9666, lng: 112.6326 },
    featured: false,
  },
  {
    id: 'banyuwangi',
    slug: 'banyuwangi',
    name: 'Banyuwangi',
    region: 'east-java',
    tagline: 'Java\'s sunrise coast — gateway between two worlds',
    description: 'The easternmost regency of Java, where the Ijen crater, Baluran\'s savannah, deserted beaches, and the ferry to Bali all converge within 90 minutes of each other.',
    longDescription: 'Banyuwangi is the unsung hero of East Java tourism. Within 90 minutes you can be at the Ijen crater basecamp, inside Baluran\'s "African savannah", snorkelling Bangsring\'s coral reef, or boarding the ferry to Bali. The Osing people — Banyuwangi\'s original ethnic group — maintain unique music, dance, and culinary traditions distinct from broader Javanese culture. Blimbingsari Airport makes Banyuwangi surprisingly accessible directly from Jakarta and Bali.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85',
    category: 'City & Nature',
    difficulty: 'Easy',
    duration: '2–3 days',
    bestSeason: 'May – September',
    highlights: [
      'Ketapang–Gilimanuk ferry crossing (30 min)',
      'Papuma Beach — white sand, teal water, limestone outcrops',
      'Pulau Merah (Red Island) — surf point and sunset views',
      'Baluran National Park — open savannah, wildlife safaris',
      'De Djawatan teak forest — a surreal Fangorn-like woodland',
    ],
    hiddenGems: [
      'Bangsring Underwater — coral reef snorkelling without crowds',
      'Alas Purwo National Park — sea turtles, leopards, pilgrimage site',
      'Muncar port sunrise — Java\'s largest fishing harbour waking up',
      'Osing Adat village — traditional Banyuwangi wedding festivals',
    ],
    localFood: [
      'Rujak Soto — Banyuwangi\'s iconic fruit-broth hybrid',
      'Pecel Pitik — spiced shredded chicken in coconut sauce',
      'Ikan Bakar Muncar — grilled fresh fish from the harbour',
      'Kopi Osing — nutty single-origin robusta from Gombengsari',
    ],
    nearbyPlaces: [
      'Ijen Crater — 1.5 hrs by car',
      'Baluran National Park — 1 hr north',
      'Gilimanuk (Bali) — 30 min by ferry',
    ],
    estimatedBudget: { min: 18, max: 55, currency: 'USD' },
    weather: { temp: '24–33°C', condition: 'Tropical coastal', humidity: '70–85%' },
    coordinates: { lat: -8.2192, lng: 114.3691 },
    featured: false,
  },
  {
    id: 'madakaripura',
    slug: 'madakaripura-waterfall',
    name: 'Madakaripura',
    region: 'east-java',
    tagline: 'Java\'s tallest waterfall — hidden inside a sacred canyon',
    description: 'A 200-metre waterfall at the end of a narrow moss-covered gorge. Considered the meditation site of Gajah Mada, Majapahit Empire\'s greatest general — enter by wading through a shallow river.',
    longDescription: 'Madakaripura ("home of the great") reaches approximately 200 metres, making it Java\'s tallest waterfall. The approach is theatrical: you wade through a waist-deep river, the canyon walls close in on both sides and become completely sheathed in moss and ferns, and then you step into a natural amphitheatre where the falls plunge all around you. Several subsidiary falls spray from three sides. A small Hindu shrine at the base marks its sacred status. Best combined with Bromo on a single day as they are only 45 minutes apart.',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=85',
    category: 'Waterfall',
    difficulty: 'Moderate',
    duration: '3–4 hours',
    bestSeason: 'May – October (passable water level)',
    highlights: [
      'Java\'s tallest single-drop waterfall (≈200 m)',
      'Narrow canyon river wade — dramatic entrance',
      'Three-sided waterfall amphitheatre',
      'Sacred Gajah Mada Hindu shrine',
      'Lush moss-and-fern canyon walls',
    ],
    hiddenGems: [
      'Arrive before 8 am — often completely empty on weekdays',
      'Small side falls at the 20-min mark of the approach trail',
      'Local guides know dry-season alternative dry paths',
    ],
    localFood: [
      'Nasi Jagung — corn-rice with sambal from roadside warung',
      'Es Kelapa Muda — fresh coconut ice at trailhead',
    ],
    nearbyPlaces: [
      'Mount Bromo — 45 min east',
      'Probolinggo Port — 40 min north (for Lombok ferries)',
    ],
    estimatedBudget: { min: 10, max: 30, currency: 'USD' },
    weather: { temp: '22–30°C', condition: 'Humid tropical canyon', humidity: '82–92%' },
    coordinates: { lat: -7.8892, lng: 113.0525 },
    featured: false,
  },
  // ── BALI ──────────────────────────────────────────────────────────────────
  {
    id: 'ubud',
    slug: 'ubud',
    name: 'Ubud',
    region: 'bali',
    tagline: 'Where Bali\'s soul lives — rice terraces, temples & healing',
    description: 'The cultural capital of Bali. Rice terrace walks, Kecak fire dance, the Sacred Monkey Forest, and genuine Balinese Hindu ceremony all coexist in a single valley.',
    longDescription: 'Ubud sits in a fertile river valley at 200 metres elevation in central Bali. It is where traditional Balinese painting, woodcarving, mask-making, and dance are still practised daily rather than performed for tourists. The Campuhan Ridge Walk, Tegallalang Rice Terraces, and Sacred Monkey Forest frame the town, while Tirta Empul holy spring draws both pilgrims and curious travellers. COMO Shambhala estate and numerous wellness retreats make Ubud the destination of choice for travellers seeking more than a beach holiday.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=85',
    category: 'Culture & Nature',
    difficulty: 'Easy',
    duration: '3–5 days',
    bestSeason: 'May – October (dry)',
    highlights: [
      'Tegallalang Rice Terrace — the iconic stepped paddies',
      'Sacred Monkey Forest Sanctuary',
      'Ubud Royal Palace — evening Kecak & Legong performances',
      'Tirta Empul purification temple',
      'Campuhan Ridge Walk — sunrise through village fields',
    ],
    hiddenGems: [
      'Sari Organic walking trail — harvest rice with a Subak farming family',
      'Pura Gunung Kawi — 11th-century rock-cut temple tombs, always quiet',
      'Penestanan village — cheaper warungs, working artists\' studios',
      'Goa Gajah Elephant Cave — 9th-century meditation site 3 km east',
    ],
    localFood: [
      'Babi Guling — spit-roasted suckling pig (Warung Ibu Oka is legendary)',
      'Bebek Betutu — slow-smoked duck in 30 spices (order 24h ahead)',
      'Lawar — minced pork and shredded coconut salad',
      'Jamu Kunyit Asam — fresh turmeric-tamarind tonic',
    ],
    nearbyPlaces: [
      'Kintamani & Mount Batur — 1 hr north',
      'Nusa Penida fast boat — 2 hrs south',
      'Canggu — 1 hr south-west',
    ],
    estimatedBudget: { min: 40, max: 160, currency: 'USD' },
    weather: { temp: '22–30°C', condition: 'Tropical highland', humidity: '70–82%' },
    coordinates: { lat: -8.5069, lng: 115.2625 },
    featured: true,
  },
  {
    id: 'uluwatu',
    slug: 'uluwatu',
    name: 'Uluwatu',
    region: 'bali',
    tagline: 'Clifftop temples, world-class surf, and fire at sunset',
    description: 'A dramatic limestone peninsula 70 metres above the Indian Ocean. Home to Pura Luhur Uluwatu, the nightly Kecak fire dance, and Bali\'s best surf breaks.',
    longDescription: 'Uluwatu occupies the Bukit Peninsula, a semi-arid limestone plateau at the southern tip of Bali. The 11th-century sea temple of Pura Luhur Uluwatu clings to a 70-metre sea cliff — one of Bali\'s six holiest temples. Every evening the Kecak dance is performed on a clifftop stage as the sun drops into the Indian Ocean behind the performers, creating one of the world\'s most theatrical spectacles. Below the cliffs, a string of hidden beaches — Padang Padang, Bingin, Impossible, Dreamland — rank among Bali\'s finest surf breaks.',
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1920&q=85',
    category: 'Temple & Surf',
    difficulty: 'Easy',
    duration: '1–2 days',
    bestSeason: 'April – October',
    highlights: [
      'Pura Luhur Uluwatu sea temple at cliff edge',
      'Kecak fire dance at sunset — best show in Bali',
      'Padang Padang beach — a hidden cove below the cliff stairs',
      'Bingin Beach — world-class left-hand surf break',
      'Jimbaran bay grilled seafood at low tables on the sand',
    ],
    hiddenGems: [
      'Nyang Nyang Beach — 30-min cliff hike, usually deserted',
      'Balangan cliff walk — sunrise with zero tourists',
      'Thomas Beach — calm water, local warungs, no crowds',
      'Impossible surf break at high tide — long peeling walls',
    ],
    localFood: [
      'Grilled king prawn at Jimbaran — eaten barefoot on the beach',
      'Acai bowls at Single Fin — cliff-view café above the surf',
      'Nasi Campur Bali — mixed plate at local warungs on Jl. Uluwatu',
    ],
    nearbyPlaces: [
      'Jimbaran Bay — 25 min north',
      'Seminyak — 45 min north',
      'Nusa Dua — 30 min north-east',
    ],
    estimatedBudget: { min: 45, max: 190, currency: 'USD' },
    weather: { temp: '26–33°C', condition: 'Sunny, ocean breeze', humidity: '62–78%' },
    coordinates: { lat: -8.8291, lng: 115.0849 },
    featured: true,
  },
  {
    id: 'nusa-penida',
    slug: 'nusa-penida',
    name: 'Nusa Penida',
    region: 'bali',
    tagline: 'Wild island, T-Rex cliffs, and manta rays in crystal water',
    description: 'Bali\'s most dramatic offshore island. Kelingking\'s T-Rex-shaped cliff, Angel\'s Billabong natural infinity pool, and Manta Point snorkelling are genuinely unmissable.',
    longDescription: 'Nusa Penida lies 20 km south-east of Sanur, reachable by fast boat in 45 minutes. Its wild limestone terrain, impossibly blue water, and total absence of traffic lights makes it feel entirely different from mainland Bali. Kelingking Beach — the \'T-Rex cliff\' — is the most photographed viewpoint in Bali. Angel\'s Billabong is a natural tidal rock pool at the cliff edge. Broken Beach is an arch-roofed bay. And Manta Point, in the channel between Nusa Penida and Nusa Lembongan, is one of the world\'s most reliable manta ray snorkelling sites.',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1920&q=85',
    category: 'Island & Marine',
    difficulty: 'Moderate',
    duration: '2–3 days',
    bestSeason: 'April – October',
    highlights: [
      'Kelingking Beach viewpoint — the T-Rex cliff',
      'Angel\'s Billabong natural tidal infinity pool',
      'Broken Beach sea arch',
      'Manta Point snorkelling — mantas year-round',
      'Crystal Bay sunset snorkelling',
    ],
    hiddenGems: [
      'Atuh Beach on the east coast — only accessible by scooter',
      'Seganing Waterfall — descend 400 steps into a sea cliff falls',
      'Tree House at Diamond Beach — overnight glamping above a cove',
      'Gamat Bay — calm, clear, good for beginner snorkellers',
    ],
    localFood: [
      'Grilled fish at Crystal Bay warung — order by weight',
      'Sate Lilit — minced fish satay on lemongrass skewers',
      'Fresh coconut water — stalls near every viewpoint',
    ],
    nearbyPlaces: [
      'Nusa Lembongan — 20 min by local boat',
      'Sanur (Bali mainland) — 45 min fast boat',
    ],
    estimatedBudget: { min: 55, max: 170, currency: 'USD' },
    weather: { temp: '27–35°C', condition: 'Sunny, strong surf season', humidity: '60–75%' },
    coordinates: { lat: -8.7278, lng: 115.5444 },
    featured: true,
  },
  {
    id: 'tanah-lot',
    slug: 'tanah-lot',
    name: 'Tanah Lot',
    region: 'bali',
    tagline: 'Bali\'s sea temple silhouette — the postcard that defines an island',
    description: 'Built on an offshore rock pillar in the 16th century, Tanah Lot is one of Bali\'s seven sea temples. The sunset silhouette draws thousands — but arrive early for a peaceful experience.',
    longDescription: 'Tanah Lot ("land in the sea") was established by the Hindu priest Dang Hyang Nirartha in the 16th century on a dramatic offshore rock. At low tide you can walk across the mossy rocks to the temple base. The resident sea snakes are considered sacred guardians. Sunset here is a ritualised spectacle; for a quieter visit, arrive at sunrise when temple ceremonies are active and the tour buses are still at breakfast.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85',
    category: 'Temple',
    difficulty: 'Easy',
    duration: 'Half day',
    bestSeason: 'May – October',
    highlights: [
      'Sea temple on a rock pillar — accessible at low tide',
      'Sacred sea snake blessing (priest-led)',
      'Sunset over the Indian Ocean',
      'Pura Batu Bolong — nearby smaller sea cliff temple',
      'Rice field walking path to the west side',
    ],
    hiddenGems: [
      'Arrive at 6 am — only local worshippers present',
      'Beraban village behind the temple — traditional architecture',
      'Bali Starling rescue centre, 10 min inland',
    ],
    localFood: [
      'Bebek Goreng Crispy — crispy fried duck from nearby warungs',
      'Coconut Ice Cream — served in a half-coconut shell at the gate',
    ],
    nearbyPlaces: [
      'Seminyak — 30 min south-east',
      'Canggu — 20 min east',
      'Tabanan town and rice terraces — 15 min inland',
    ],
    estimatedBudget: { min: 12, max: 45, currency: 'USD' },
    weather: { temp: '26–33°C', condition: 'Coastal breeze', humidity: '65–80%' },
    coordinates: { lat: -8.6211, lng: 115.0865 },
    featured: false,
  },
  {
    id: 'kintamani',
    slug: 'kintamani',
    name: 'Kintamani & Mount Batur',
    region: 'bali',
    tagline: 'Volcanic caldera at 1,500 m — Bali\'s highest sunrise trek',
    description: 'Bali\'s most accessible active volcano sits inside a vast highland caldera beside the sacred crater lake. The 2 am sunrise trek is one of the island\'s essential experiences.',
    longDescription: 'Kintamani is the highland plateau overlooking the 13 km-wide Batur caldera — one of the world\'s largest. Mount Batur (1,717 m) is the active cone within it, still venting steam. The pre-dawn trek (2 am departure, ~1.5 hrs) delivers a sunrise above the cloud layer with 360-degree views across Bali and East Java on a clear day. Below, Lake Batur mirrors the sky at first light. After the descent, Toya Bungkah hot springs on the lake shore provide natural volcanic relaxation. The nearby Penglipuran village is considered Bali\'s best-preserved traditional village.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
    category: 'Volcano',
    difficulty: 'Moderate',
    duration: '1–2 days',
    bestSeason: 'April – October',
    elevation: '1,717 m',
    highlights: [
      'Mount Batur sunrise trek — depart 2 am, summit by 5:30 am',
      'Panoramic caldera view from the rim',
      'Toya Bungkah volcanic hot springs on Lake Batur',
      'Penglipuran traditional Balinese village (UNESCO-listed candidate)',
      'Kintamani panoramic lunch restaurants with caldera view',
    ],
    hiddenGems: [
      'Songan village on the lake\'s west shore — almost no tourists',
      'East rim trail — quieter path with better lake views',
      'Pura Ulun Danu Batur — floating temple on the lake',
      'Kintamani strawberry farms — pick and eat at source',
    ],
    localFood: [
      'Corn roasted on the summit at sunrise — a local guide tradition',
      'Babi Guling Kintamani — highland version of suckling pig',
      'Kopi Kintamani — distinctive fruity single-origin arabica',
    ],
    nearbyPlaces: [
      'Ubud — 1 hr south',
      'Tegallalang Rice Terrace — 45 min south-west',
      'Besakih Mother Temple — 40 min east',
    ],
    estimatedBudget: { min: 30, max: 90, currency: 'USD' },
    weather: { temp: '12–22°C', condition: 'Cool highland, misty morning', humidity: '62–78%' },
    coordinates: { lat: -8.2436, lng: 115.3756 },
    featured: false,
  },
  {
    id: 'canggu',
    slug: 'canggu',
    name: 'Canggu',
    region: 'bali',
    tagline: 'Bali\'s surf-and-specialty-coffee village grown into a lifestyle capital',
    description: 'Where Echo Beach surf meets rice-paddy yoga studios, rooftop cocktail bars, and the highest concentration of great food per square kilometre in Bali.',
    longDescription: 'Canggu transformed from a quiet surf village into Bali\'s most dynamic neighbourhood over the last decade. Batu Bolong and Echo Beach attract consistent left-hand surf year-round. Between sessions, the area\'s café culture — The Shady Shack, Satu, ACID — rivals any Southeast Asian food destination. The rice paddies behind the main strip are still worked by local Subak cooperatives, creating a surreal contrast of roosters and flat whites. Canggu is increasingly the base of choice for long-stay travellers, digital nomads, and young families wanting proximity to the sea.',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1920&q=85',
    category: 'Beach & Lifestyle',
    difficulty: 'Easy',
    duration: '3–7 days',
    bestSeason: 'April – October',
    highlights: [
      'Echo Beach left-hand break at sunrise',
      'Batu Bolong temple on the sea cliff',
      'Rice paddy cycling through Subak fields',
      'Pasar Seni Canggu — Saturday morning artisan market',
      'La Brisa bamboo beach club — Bali at its most photogenic',
    ],
    hiddenGems: [
      'Pererenan rice fields — 10 min from the beach, unmarked trail',
      'Seseh Beach — black sand, wild, no vendors',
      'Canggu Community Centre market — Sunday 7–11 am',
      'Old Man\'s bar — Canggu institution, great people-watching',
    ],
    localFood: [
      'Açaí bowl at The Shady Shack — legendary, always queued',
      'Sate Lilit at Warung Dandelion — Balinese home cooking',
      'Cold-brew kopi at Satu — local beans, Canggu roasted',
    ],
    nearbyPlaces: [
      'Seminyak — 15 min south',
      'Tanah Lot — 20 min north',
      'Ubud — 1 hr east',
    ],
    estimatedBudget: { min: 40, max: 175, currency: 'USD' },
    weather: { temp: '26–33°C', condition: 'Sunny coastal', humidity: '65–80%' },
    coordinates: { lat: -8.6575, lng: 115.1313 },
    featured: false,
  },
]

// ─── TOUR PACKAGES ────────────────────────────────────────────────────────────

export const tourPackages: TourPackage[] = [
  {
    id: 'bromo-sunrise',
    slug: 'bromo-sunrise-tour',
    title: 'Bromo Sunrise Classic',
    subtitle: 'The iconic pre-dawn jeep ride and crater walk that defines East Java — done right',
    coverImage: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1200&q=85',
    duration: '2D / 1N',
    durationDays: 2,
    price: { usd: 79, idr: 1185000 },
    originalPrice: { usd: 105, idr: 1575000 },
    maxGroupSize: 13,
    difficulty: 'Moderate',
    type: 'shared',
    category: ['Volcano', 'Sunrise', 'Adventure'],
    highlights: [
      'Penanjakan viewpoint — best sunrise panorama in East Java',
      '4WD Jeep convoy across the volcanic sand sea',
      'Crater rim walk 100 m above the smoking vent',
      'Teletubbies Hill rolling golden savannah',
      'Hotel pickup from Surabaya or Malang included',
    ],
    included: [
      'Private Toyota HiAce door-to-door transfer',
      '4WD Jeep hire at Bromo (shared jeep, 4–5 persons per jeep)',
      'National park entrance fee (IDR 320,000 foreigner)',
      'English-speaking licensed guide throughout',
      'Hotel or station pickup from Surabaya / Malang',
      'Mineral water and morning snack box',
    ],
    excluded: [
      'Accommodation (guesthouse on-site IDR 250,000–500,000/night)',
      'Meals beyond the morning snack box',
      'Horse rental at the sand sea (IDR 50,000–100,000, optional)',
      'Personal travel insurance',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Afternoon Departure — Arrive Cemoro Lawang',
        description: 'Depart Surabaya or Malang by early afternoon. The drive winds up through Tengger highlands, arriving at Cemoro Lawang crater-rim village by early evening. Early dinner and rest — alarm set for 3:15 am.',
        activities: ['Hotel / station pickup at agreed time', 'Scenic highland drive (2.5–3 hrs)', 'Check-in at crater-rim guesthouse', 'Dinner at local warung', 'Guide briefing — timing, gear, what to expect'],
        meals: ['Dinner (own cost, guide recommends)'],
        accommodation: 'Lava View Lodge, Bromo Permai, or similar (own cost)',
      },
      {
        day: 2,
        title: 'Pre-Dawn Jeep — Sunrise — Sand Sea — Crater Rim',
        description: 'Jeeps depart at 3:30 am for the 45-minute ride to Penanjakan viewpoint. Sunrise paints the caldera at approximately 5:30 am. Return to the sand sea base, then walk or take a horse across 2 km of volcanic ash to the crater steps. Depart by 9 am for the return journey.',
        activities: ['3:15 am wake-up call', '3:30 am 4WD Jeep convoy to Penanjakan (2,770 m)', '5:30 am sunrise over Bromo, Semeru, and Argopuro', 'Descent to sand sea and crater approach', 'Crater rim walk — peer into the active vent', 'Teletubbies Hill stop on return', 'Depart for Surabaya / Malang by 9 am', 'Arrive home by early afternoon'],
        meals: ['Snack box provided en route'],
        accommodation: 'None (return trip)',
        image: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=800&q=80',
      },
    ],
    pickupPoints: ['Juanda Airport T1 / T2', 'Gubeng Station', 'Pasar Turi Station', 'Malang Kota Baru Station', 'Arjosari Terminal'],
    availableSeats: 7,
    totalSeats: 13,
    nextDeparture: '2026-05-22',
    rating: 4.9,
    reviewCount: 1_024,
    featured: true,
    tags: ['Best Seller', 'Sunrise', 'Volcanic'],
    distance: '≈ 130 km from Surabaya',
    routeDescription: 'Surabaya / Malang → Pasuruan → Probolinggo → Cemoro Lawang → Penanjakan → Sand Sea → Crater Rim',
  },
  {
    id: 'bromo-ijen',
    slug: 'bromo-ijen-expedition',
    title: 'Bromo + Ijen Expedition',
    subtitle: 'Two volcanoes in four days — Java\'s most dramatic volcanic double header',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    duration: '4D / 3N',
    durationDays: 4,
    price: { usd: 195, idr: 2925000 },
    maxGroupSize: 11,
    difficulty: 'Challenging',
    type: 'shared',
    category: ['Volcano', 'Adventure', 'Expedition'],
    highlights: [
      'Bromo sunrise from Penanjakan — 2,770 m panorama',
      'Ijen blue fire — visible midnight to 3 am only',
      'Turquoise sulfuric crater lake at sunrise',
      'Optional ferry connection to Bali at trip end',
      'Fully escorted with licensed bilingual guide',
    ],
    included: [
      'Toyota HiAce overland transport throughout',
      '4WD Jeep fleet at Bromo',
      'Gas mask at Ijen (mandatory — included in fee)',
      'All national park and crater entrance fees',
      'Bilingual guide (Indonesian + English)',
      'Hotel / airport pickup from Surabaya',
      'Mineral water throughout',
    ],
    excluded: [
      'Accommodation — 3 nights (approx. USD 15–40/night at local stays)',
      'All meals',
      'Banyuwangi–Gilimanuk ferry if continuing to Bali (IDR 10,000)',
      'Porter at Ijen (optional, IDR 150,000 — recommended for first-time trekkers)',
      'Travel insurance',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Surabaya → Probolinggo → Cemoro Lawang',
        description: 'Afternoon departure from Surabaya. Scenic drive through Tengger highlands. Arrive at Cemoro Lawang crater rim for dinner and early rest.',
        activities: ['Afternoon pickup from hotel / station', 'Highland drive 2.5–3 hrs', 'Check-in at crater-rim lodge', 'Guide briefing on Day 2 itinerary'],
        meals: ['Dinner (own cost)'],
        accommodation: 'Lava View Lodge or Bromo Permai',
      },
      {
        day: 2,
        title: 'Bromo Sunrise + Sand Sea + Afternoon Rest',
        description: 'Pre-dawn jeep at 3:30 am. Full Bromo experience including sunrise, crater walk, and Teletubbies Hill. Back by 9 am — free afternoon to relax.',
        activities: ['3:30 am Jeep convoy to Penanjakan', 'Sunrise panorama', 'Sand sea and crater rim walk', 'Teletubbies Hill stop', 'Free afternoon at crater rim'],
        meals: ['Snack box', 'Lunch (own cost)'],
        accommodation: 'Lava View Lodge',
      },
      {
        day: 3,
        title: 'Bromo → Banyuwangi (9-hour cross-Java drive)',
        description: 'Long but scenic drive across East Java through coffee and rubber plantations, rubber-tapper villages, and the coast. Arrive Banyuwangi by evening for the midnight Ijen hike.',
        activities: ['9 am depart from Cemoro Lawang', 'Scenic stops en route (rubber plantations, views)', 'Arrive Banyuwangi / Ijen Paltuding basecamp by 7 pm', 'Early dinner and rest — depart midnight'],
        meals: ['Lunch stop en route'],
        accommodation: 'Paltuding basecamp homestay or Banyuwangi budget hotel',
      },
      {
        day: 4,
        title: 'Ijen Blue Fire (Midnight) → Crater Lake Sunrise',
        description: 'Midnight departure from basecamp. Hike 3 km uphill (1.5 hrs) in darkness. Blue flames appear from 12:30 am. Stay for crater lake sunrise. Descend by 7 am. Option to continue to Ketapang ferry for Bali.',
        activities: ['12:00 am depart Paltuding basecamp', '1:30 am arrive crater rim', 'Blue fire viewing (12:30–3:30 am)', 'Sunrise over turquoise crater lake at 5:30 am', '7 am descent and breakfast', 'Optional: Ketapang ferry to Bali (20 min drive)', 'Or: Return to Surabaya / Malang'],
        meals: ['Breakfast after descent'],
        accommodation: 'None (end of programme)',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      },
    ],
    pickupPoints: ['Juanda Airport T1 / T2', 'Gubeng Station', 'Malang Kota Baru Station'],
    availableSeats: 4,
    totalSeats: 11,
    nextDeparture: '2026-05-25',
    rating: 4.9,
    reviewCount: 748,
    featured: true,
    tags: ['Epic', 'Multi-Day', 'Blue Fire'],
    distance: '≈ 620 km total circuit',
    routeDescription: 'Surabaya → Bromo (2D) → Cross-Java drive → Banyuwangi → Ijen Crater → (Optional: Bali)',
  },
  {
    id: 'surabaya-bali-overland',
    slug: 'surabaya-bali-overland',
    title: 'East Java to Bali Overland',
    subtitle: 'The complete East Java adventure — six days across volcanoes, waterfalls, and a sea crossing',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
    duration: '6D / 5N',
    durationDays: 6,
    price: { usd: 345, idr: 5175000 },
    maxGroupSize: 11,
    difficulty: 'Moderate',
    type: 'shared',
    category: ['Overland', 'Multi-Destination', 'Adventure'],
    highlights: [
      'Malang — colonial city & Jodipan colourful village',
      'Tumpak Sewu — canyon floor walk behind the falls',
      'Bromo — pre-dawn jeep and crater rim',
      'Ijen — midnight blue fire and crater lake',
      'Ketapang–Gilimanuk ferry crossing to Bali',
    ],
    included: [
      'Toyota HiAce full overland transport — door to door',
      '4WD Jeep fleet at Bromo',
      'Gas mask at Ijen',
      'Tumpak Sewu local canyon guide and safety rope',
      'All national park and site entrance fees',
      'Ferry crossing Ketapang → Gilimanuk',
      'English-speaking licensed guide',
      'Hotel / airport pickup from Surabaya or Malang',
    ],
    excluded: [
      'Accommodation — 5 nights (budget USD 15–45/night)',
      'All meals (guide recommends restaurants at each stop)',
      'Travel insurance',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Malang — Colonial Streets & Jodipan',
        description: 'Start in Malang. Morning visit to the colonial alun-alun, then Jodipan and Ksatrian kampung warna-warni. Afternoon at Museum Angkut or the Singosari temple ruins nearby.',
        activities: ['Hotel pickup in Malang or Surabaya (Malang start recommended)', 'Alun-Alun Malang and Ijen Boulevard colonial architecture', 'Jodipan Colourful Village photo walk', 'Museum Angkut (optional, own entry fee)', 'Evening at Batu Night Spectacular or city restaurants'],
        meals: [],
        accommodation: 'Malang city hotel (own cost)',
      },
      {
        day: 2,
        title: 'Malang → Tumpak Sewu (Canyon Descent)',
        description: 'Drive 3 hours south to Lumajang district. Full half-day at Tumpak Sewu including guided canyon descent, behind-falls walk, and Goa Tetes cave option.',
        activities: ['Depart Malang 6:30 am', 'Arrive Tumpak Sewu viewpoint 9:30 am', 'Guided canyon descent (safety ropes, ~45 min)', 'Walk behind the 120 m curtain of water', 'Goa Tetes cave exploration (optional)', 'Drive to Pronojiwo homestay'],
        meals: [],
        accommodation: 'Pronojiwo village homestay',
      },
      {
        day: 3,
        title: 'Tumpak Sewu → Bromo (Afternoon Arrival)',
        description: 'Morning free to revisit the viewpoint at golden hour. Drive north to Cemoro Lawang. Rest afternoon for the 3:30 am wake-up.',
        activities: ['Optional sunrise at Tumpak Sewu viewpoint 5:30 am', 'Depart 8 am, arrive Cemoro Lawang 11 am', 'Rest and acclimatise at 2,700 m elevation', 'Guide evening briefing'],
        meals: [],
        accommodation: 'Lava View Lodge or Bromo Permai',
      },
      {
        day: 4,
        title: 'Bromo Sunrise → Cross-Java Drive → Banyuwangi',
        description: 'Full Bromo experience pre-dawn, then the long but scenic cross-Java drive to Banyuwangi for the Ijen midnight departure.',
        activities: ['3:30 am Jeep to Penanjakan', 'Sunrise, sand sea, crater rim walk', 'Teletubbies Hill stop', 'Depart Bromo 9:30 am', 'Scenic drive through coffee belt (7 hrs)', 'Arrive Paltuding basecamp 6:30 pm', 'Rest before midnight hike'],
        meals: [],
        accommodation: 'Paltuding homestay near Ijen basecamp',
      },
      {
        day: 5,
        title: 'Ijen Midnight Hike → Blue Fire → Crater Lake',
        description: 'The spiritual high point of the trip. Three hours of sleep, then the midnight hike for the blue fire. Sunrise over the turquoise lake. Descend and drive to ferry.',
        activities: ['Midnight depart Paltuding', 'Crater rim arrive 1:30 am', 'Blue fire 12:30–3:30 am', 'Crater lake sunrise 5:30 am', 'Descend and breakfast 7:30 am', 'Drive to Ketapang harbour', 'Ferry crossing to Gilimanuk, Bali (30 min)'],
        meals: ['Breakfast after descent (included)'],
        accommodation: 'Bali — Kuta / Seminyak (own cost)',
      },
      {
        day: 6,
        title: 'Arrive Bali — Transfer to Hotel',
        description: 'Cross the Bali Strait and enter the island. Transfer to your Bali hotel. Programme ends.',
        activities: ['Ferry arrival Gilimanuk', 'Drive to Kuta / Seminyak / Ubud / Canggu based on your hotel', 'Drop-off and end of programme'],
        meals: [],
        accommodation: 'Your Bali hotel',
      },
    ],
    pickupPoints: ['Juanda Airport T1 / T2', 'Gubeng Station', 'Malang Kota Baru Station', 'Arjosari Terminal'],
    availableSeats: 5,
    totalSeats: 11,
    nextDeparture: '2026-05-28',
    rating: 5.0,
    reviewCount: 512,
    featured: true,
    tags: ['Flagship Route', '6 Days', 'Java → Bali'],
    distance: '≈ 920 km total overland',
    routeDescription: 'Malang → Tumpak Sewu → Bromo → Cross-Java → Ijen → Ferry → Bali',
  },
  {
    id: 'tumpak-sewu-adventure',
    slug: 'tumpak-sewu-adventure',
    title: 'Tumpak Sewu Waterfall Trek',
    subtitle: 'Descend into the canyon, walk behind the falls, explore Goa Tetes — a true Indonesian gem',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    duration: '2D / 1N',
    durationDays: 2,
    price: { usd: 65, idr: 975000 },
    maxGroupSize: 10,
    difficulty: 'Challenging',
    type: 'shared',
    category: ['Waterfall', 'Trekking', 'Adventure'],
    highlights: [
      'Clifftop panoramic viewpoint over the horseshoe falls',
      'Guided 45-min canyon descent with fixed ropes',
      'Walk directly behind the waterfall curtain',
      'Goa Tetes — limestone cave with underground springs',
      'Night in a traditional Pronojiwo village homestay',
    ],
    included: [
      'Toyota HiAce transport from Malang or Surabaya',
      'Local canyon guide and safety equipment',
      'All entrance and descent fees',
      'Goa Tetes cave guide (optional add-on)',
      'Hotel pickup from Malang or Surabaya',
    ],
    excluded: [
      'Accommodation in Pronojiwo (own cost — approx. IDR 150,000/night)',
      'All meals',
      'Personal travel insurance',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Malang / Surabaya → Pronojiwo (3 hrs)',
        description: 'Morning departure. Stop at Coban Sewu overlook for a first teaser view. Check in at a local homestay and rest.',
        activities: ['Depart 6:30 am from Malang (8 am from Surabaya)', 'Arrive Pronojiwo by 10 am', 'Clifftop viewpoint orientation', 'Rest and homestay check-in', 'Guide evening briefing on canyon descent'],
        meals: ['Lunch at roadside warung (own cost)'],
        accommodation: 'Pronojiwo homestay (own cost — approx. USD 10/night)',
      },
      {
        day: 2,
        title: 'Canyon Descent → Behind the Falls → Goa Tetes',
        description: 'Full immersive day. Leave at 7 am to beat tour groups. Guide-led descent with ropes takes 45 minutes. Spend 1–2 hours at the base. Option to visit Goa Tetes cave system before the return hike.',
        activities: ['7 am depart for canyon entrance', '7:45 am begin guided descent (ropes, slippery rocks)', 'Arrive canyon floor 8:30 am', 'Walk behind the waterfall curtain', 'Goa Tetes cave entry (optional 1 hr)', 'Return ascent 10:30 am (1 hr)', 'Depart for Malang / Surabaya by noon'],
        meals: ['Snack box on trail', 'Lunch on return drive'],
        accommodation: 'None (return)',
      },
    ],
    pickupPoints: ['Malang Kota Baru Station', 'Arjosari Terminal', 'Alun-Alun Malang', 'Juanda Airport (Surabaya)'],
    availableSeats: 8,
    totalSeats: 10,
    nextDeparture: '2026-05-23',
    rating: 4.8,
    reviewCount: 418,
    featured: false,
    tags: ['Hidden Gem', 'Trekking', 'Waterfall'],
    distance: '≈ 165 km from Malang',
    routeDescription: 'Malang / Surabaya → Lumajang → Pronojiwo → Tumpak Sewu Canyon',
  },
  {
    id: 'malang-hidden-gems',
    slug: 'malang-hidden-gems',
    title: 'Malang Hidden Gems Tour',
    subtitle: 'Colourful kampungs, vintage vehicles, highland waterfalls, and apple country in 2 days',
    coverImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=85',
    duration: '2D / 1N',
    durationDays: 2,
    price: { usd: 49, idr: 735000 },
    maxGroupSize: 14,
    difficulty: 'Easy',
    type: 'shared',
    category: ['City', 'Culture', 'Photography'],
    highlights: [
      'Jodipan & Ksatrian — the original painted kampung',
      'Museum Angkut — 300 vintage vehicles in themed zones',
      'Batu Night Spectacular — illuminated gardens after dark',
      'Coban Rondo waterfall — an easy tropical canyon walk',
      'Batu apple orchards — pick-your-own at source',
    ],
    included: [
      'Toyota HiAce transport throughout the 2 days',
      'Licensed Malang city guide',
      'All transport within the tour',
      'Hotel pickup from Malang or Surabaya (airport / station)',
    ],
    excluded: [
      'Museum Angkut entry (IDR 100,000 foreigners)',
      'Batu Night Spectacular entry (IDR 65,000)',
      'Accommodation in Malang (own cost)',
      'All meals',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Malang Old City + Jodipan + Batu Highland',
        description: 'Start at the colonial alun-alun and Ijen Boulevard — Dutch-era architecture still standing. Walk through the Instagram-famous Jodipan village. Afternoon at Museum Angkut, evening at Batu Night Spectacular.',
        activities: ['Hotel pickup 8 am', 'Alun-Alun Malang and Ijen Boulevard walk', 'Jodipan Colourful Village (Kampung Warna-Warni)', 'Toko Oen 1930s Dutch-era café for lunch', 'Museum Angkut (optional own entry)', 'Batu Night Spectacular (optional own entry)'],
        meals: ['Lunch recommendation'],
        accommodation: 'Malang city hotel (own cost)',
      },
      {
        day: 2,
        title: 'Coban Rondo Waterfall + Apple Orchards',
        description: 'Drive 30 min into the highlands for Coban Rondo waterfall — a 84-metre drop with a short jungle trail. Continue to apple orchard farms for pick-your-own fruit, then return to Malang.',
        activities: ['Depart hotel 7 am', 'Coban Rondo waterfall trail (45 min)', 'Apple and strawberry orchard visit', 'Local jamu herbal drink tasting', 'Return to Malang by noon', 'Drop-off at hotel / station / airport'],
        meals: ['Breakfast box'],
        accommodation: 'None (end of programme)',
      },
    ],
    pickupPoints: ['Malang Kota Baru Station', 'Abdul Rachman Saleh Airport', 'Arjosari Terminal', 'Alun-Alun Malang', 'Universitas Brawijaya'],
    availableSeats: 11,
    totalSeats: 14,
    nextDeparture: '2026-05-21',
    rating: 4.7,
    reviewCount: 631,
    featured: false,
    tags: ['Family Friendly', 'Photography', 'Easy'],
    distance: '≈ 55 km circuit from Malang',
    routeDescription: 'Malang → Jodipan → Batu → Museum Angkut → Coban Rondo → Batu Apple Orchards → Malang',
  },
  {
    id: 'bali-tropical-escape',
    slug: 'bali-tropical-escape',
    title: 'Bali Tropical Escape',
    subtitle: 'Five days across Bali\'s iconic and hidden corners — culture, island, temple, and volcano',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
    duration: '5D / 4N',
    durationDays: 5,
    price: { usd: 289, idr: 4335000 },
    maxGroupSize: 10,
    difficulty: 'Easy',
    type: 'private',
    category: ['Bali', 'Culture', 'Beach', 'Island'],
    highlights: [
      'Ubud — rice terrace walk, Sacred Monkey Forest, Kecak dance',
      'Nusa Penida — Kelingking cliff, Angel\'s Billabong, manta snorkel',
      'Uluwatu — clifftop temple and sunset Kecak fire dance',
      'Kintamani — volcanic caldera panorama and hot springs',
      'Tanah Lot — sea temple at golden hour',
    ],
    included: [
      'Private Toyota HiAce for all 5 days — total flexibility',
      'All temple, park, and site entrance fees',
      'English-speaking Bali-licensed guide',
      'Nusa Penida return speed boat from Sanur',
      'Ngurah Rai Airport pickup and drop-off',
      'Mineral water throughout',
    ],
    excluded: [
      'Accommodation — 4 nights (many hotel options to suit budget)',
      'All meals',
      'Travel insurance',
      'Personal expenses',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrive Bali — Seminyak Welcome',
        description: 'Airport pickup and transfer to Seminyak hotel. Afternoon at leisure. Sunset walk on Seminyak or Petitenget beach.',
        activities: ['VIP airport welcome and garland', 'Hotel check-in Seminyak / Kuta', 'Sunset at Seminyak beach', 'Dinner at Jalan Laksmana restaurant strip (own cost)'],
        meals: [],
        accommodation: 'Seminyak hotel (own cost)',
      },
      {
        day: 2,
        title: 'Ubud Full Cultural Day',
        description: 'Full day in the cultural heartland. Rice terrace walk, monkey forest, market, royal palace, and evening Kecak dance.',
        activities: ['Tegallalang Rice Terrace walk 8 am (low season: sunrise light)', 'Sacred Monkey Forest Sanctuary', 'Ubud Art Market and Jalan Raya boutiques', 'Ubud Royal Palace (Puri Saren)', 'Evening Kecak and Fire Dance at Ubud Palace', 'Dinner at Locavore area (Bali\'s best restaurants)'],
        meals: ['Lunch recommendation'],
        accommodation: 'Ubud hotel (own cost)',
      },
      {
        day: 3,
        title: 'Nusa Penida Island Escape',
        description: 'Early morning fast boat from Sanur. Full day on Nusa Penida\'s dramatic western circuit.',
        activities: ['6:30 am depart hotel', '7:15 am fast boat from Sanur to Nusa Penida (45 min)', 'Kelingking Beach viewpoint (T-Rex cliff)', 'Angel\'s Billabong tidal infinity pool', 'Broken Beach sea arch', 'Crystal Bay snorkelling (mantas common)', '4:30 pm fast boat return to Sanur'],
        meals: ['Lunch box on island'],
        accommodation: 'Ubud or Kuta hotel (own cost)',
      },
      {
        day: 4,
        title: 'South Bali — Tanah Lot + Uluwatu Sunset',
        description: 'Late morning at Tanah Lot, then the dramatic Uluwatu clifftop and legendary Kecak fire dance at dusk.',
        activities: ['10 am Tanah Lot sea temple visit (low tide walk)', '1 pm Jimbaran lunch', '3 pm Uluwatu temple walk and cliff views', '6 pm Kecak fire dance at Pura Luhur Uluwatu', 'Dinner at Jimbaran bay grilled seafood (own cost)'],
        meals: ['Lunch in Jimbaran'],
        accommodation: 'Kuta / Seminyak hotel (own cost)',
      },
      {
        day: 5,
        title: 'Kintamani Volcano Panorama + Airport Transfer',
        description: 'Morning drive to the Batur caldera for an iconic highland farewell view, then Tegallalang for a final rice terrace photo stop before the airport.',
        activities: ['Depart hotel 7 am', 'Kintamani volcanic caldera panorama (9 am)', 'Hot spring stop at Toya Bungkah (optional)', 'Tegallalang rice terrace stop', 'Airport transfer — arrive by 2 pm for evening flights'],
        meals: [],
        accommodation: 'Departure',
      },
    ],
    pickupPoints: ['Ngurah Rai International Airport', 'Kuta', 'Seminyak', 'Ubud', 'Canggu', 'Sanur', 'Nusa Dua'],
    availableSeats: 6,
    totalSeats: 10,
    nextDeparture: '2026-06-01',
    rating: 4.9,
    reviewCount: 342,
    featured: true,
    tags: ['Bali', 'Private', 'All-Inclusive Tour'],
    distance: '≈ 360 km Bali circuit',
    routeDescription: 'Ngurah Rai Airport → Seminyak → Ubud → Nusa Penida → Uluwatu → Kintamani → Ngurah Rai',
  },
  {
    id: 'luxury-east-java',
    slug: 'luxury-east-java-escape',
    title: 'Luxury East Java Escape',
    subtitle: 'The complete East Java volcanic journey — private vehicle, 4-star stays, and all meals included',
    coverImage: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1200&q=85',
    duration: '5D / 4N',
    durationDays: 5,
    price: { usd: 650, idr: 9750000 },
    maxGroupSize: 6,
    difficulty: 'Moderate',
    type: 'luxury',
    category: ['Luxury', 'Private', 'Volcano', 'Premium'],
    highlights: [
      'Exclusive private vehicle — your group only',
      'Private Penanjakan jeep fleet at Bromo (no waiting)',
      'Premium guided canyon descent at Tumpak Sewu',
      'Ijen VIP guide with professional gas mask and headlamp kit',
      'All meals at curated restaurants, all 5 days',
    ],
    included: [
      'Exclusive Toyota HiAce Premio (luxury recline seats, Wi-Fi)',
      'Premium 4-star hotels — 4 nights (breakfast included)',
      'All meals — 5 days (curated local and international restaurants)',
      'Private certified guide — speaks English, Japanese, or Korean on request',
      'All park, entrance, and crater fees',
      'Private 4WD Jeep fleet at Bromo (4 pax per jeep)',
      'Gas mask kit, trekking poles, and headlamp set at Ijen',
      'Surabaya Airport VIP meet-and-greet',
      'Welcome gift bag (Javanese coffee, spice kit)',
    ],
    excluded: [
      'International and domestic flights',
      'Travel insurance',
      'Personal shopping and spa treatments',
    ],
    itinerary: [
      {
        day: 1,
        title: 'VIP Surabaya Welcome + Highland Transfer',
        description: 'VIP airport welcome with name board and floral garland. Briefing lunch at a premium Surabaya restaurant. Afternoon drive to Malang for accommodation.',
        activities: ['VIP airport welcome', 'Welcome lunch at Surabaya premium restaurant', 'Drive to Malang highland hotel (2 hrs)', 'Hotel check-in, freshen up', 'Dinner at Plataran Heritage Malang restaurant'],
        meals: ['Lunch', 'Dinner'],
        accommodation: 'Plataran Heritage Malang or Swiss-Belhotel Malang',
      },
      {
        day: 2,
        title: 'Malang + Tumpak Sewu Private Canyon Experience',
        description: 'Morning exploration of Malang\'s hidden gems with private guide. Afternoon private canyon descent at Tumpak Sewu with VIP equipment and minimal crowds.',
        activities: ['Private Malang walking tour (colonial, Jodipan)', 'Coban Rondo waterfall scenic stop', 'Picnic lunch en route to Tumpak Sewu', 'Private guided canyon descent 2 pm (fewer tourists)', 'Return to Pronojiwo highland dinner'],
        meals: ['Breakfast', 'Picnic Lunch', 'Dinner'],
        accommodation: 'Bromo crater rim premium lodge',
      },
      {
        day: 3,
        title: 'Private Bromo VIP Sunrise',
        description: 'Private jeep fleet. No sharing with strangers. Penanjakan viewpoint watched in your own group\'s time. Full crater walk and savannah.',
        activities: ['3:30 am Private Jeep convoy', 'Penanjakan private platform (guide clears space)', 'Sand sea jeep convoy', 'Crater rim walk with mineralogy explanation', 'Teletubbies Hill golden hour session', 'Premium lunch at crater rim lodge'],
        meals: ['Breakfast box', 'Lunch', 'Dinner'],
        accommodation: 'Lava View Lodge Premium Suite',
      },
      {
        day: 4,
        title: 'Cross-Java Drive → Banyuwangi Luxury Resort',
        description: 'Scenic drive with curated stops at coffee plantations and rubber processing. Arrive at Banyuwangi luxury resort. Rest before the midnight Ijen hike.',
        activities: ['Kopi Osing plantation tour and cupping', 'Bangsring Underwater snorkelling option', 'Arrive Ketapang Indah Hotel', 'Dinner at resort restaurant', 'Rest — 11 pm Ijen departure'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Ketapang Indah Hotel (cliff-side bungalow)',
      },
      {
        day: 5,
        title: 'Ijen Blue Fire → Crater Sunrise → Luxury Farewell',
        description: 'Midnight hike with premium guide, headlamp, and trekking poles. Sunrise over the turquoise crater. Return for resort breakfast and transfer to Bali or Surabaya airport.',
        activities: ['Midnight hike with premium safety kit', 'Blue fire viewing in guided group', 'Crater lake sunrise photography session', 'Resort breakfast 8 am', 'Transfer to Ketapang ferry (Bali option) or Surabaya airport'],
        meals: ['Breakfast'],
        accommodation: 'None (end of programme)',
      },
    ],
    pickupPoints: ['Juanda Airport T1 / T2', 'Premium Surabaya hotels'],
    availableSeats: 2,
    totalSeats: 6,
    nextDeparture: '2026-06-07',
    rating: 5.0,
    reviewCount: 94,
    featured: false,
    tags: ['Luxury', 'All-Inclusive', 'Private'],
    distance: '≈ 680 km circuit',
    routeDescription: 'Surabaya → Malang → Tumpak Sewu → Bromo → Banyuwangi → Ijen → (Bali or Surabaya)',
  },
  {
    id: 'honeymoon-bali',
    slug: 'honeymoon-tropical-bali',
    title: 'Honeymoon in Bali',
    subtitle: 'Seven days of romance — private pool villa, sunset dinner on the cliff, and the best of Bali for two',
    coverImage: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1200&q=85',
    duration: '7D / 6N',
    durationDays: 7,
    price: { usd: 845, idr: 12675000 },
    maxGroupSize: 2,
    difficulty: 'Easy',
    type: 'honeymoon',
    category: ['Honeymoon', 'Romance', 'Bali', 'Luxury'],
    highlights: [
      'Private pool villa with in-villa breakfast service',
      'Couples spa at COMO Shambhala Estate, Ubud',
      'Jimbaran sunset seafood dinner — tables on the sand',
      'Private fast boat to Nusa Penida — just the two of you',
      'Romantic room decorations with Balinese floral arrangement',
    ],
    included: [
      'Exclusive private Toyota HiAce for all 7 days',
      'Premium villa with private pool — 6 nights',
      'Romantic room decoration on arrival (petals, candles)',
      'Couples spa session (90 min) at premium spa',
      'Three romantic dinners (Days 1, 4, 6)',
      'Private speed boat to Nusa Penida',
      'All entrance and activity fees',
      'Ngurah Rai Airport VIP welcome',
      'Welcome flower garland and champagne',
    ],
    excluded: [
      'International and domestic flights',
      'Personal expenses and shopping',
      'Travel insurance',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Romantic Arrival — Flower-Strewn Villa',
        description: 'VIP airport welcome with your names on a handwritten board. Private transfer to villa. Flowers, candles, and champagne waiting on arrival. Evening at Ku De Ta or Potato Head for sundowners.',
        activities: ['VIP airport meet-and-greet', 'Private villa check-in with floral setup', 'Champagne and fresh fruit welcome', 'Sunset cocktails at Seminyak beach club'],
        meals: ['Romantic welcome dinner at villa or beach restaurant'],
        accommodation: 'Private pool villa, Seminyak',
      },
      {
        day: 2,
        title: 'Ubud Romance — Spa & Rice Terrace Picnic',
        description: 'A day for the senses in Bali\'s cultural heart. Morning couples massage, afternoon rice terrace picnic, evening authentic Balinese dinner.',
        activities: ['90-min couples massage at COMO Shambhala or Alaya Ubud', 'Campuhan Ridge Walk', 'Picnic lunch in the Tegallalang rice terraces', 'Ubud Palace evening Kecak dance', 'Dinner at Locavore restaurant'],
        meals: ['Picnic lunch', 'Romantic dinner'],
        accommodation: 'Komaneka at Bisma Ubud',
      },
      {
        day: 3,
        title: 'Nusa Penida — Private Island Escape',
        description: 'Private fast boat for just the two of you. Cliffside views, crystal water, manta rays.',
        activities: ['7 am private boat from Sanur', 'Kelingking Beach T-Rex cliff viewpoint', 'Manta Point snorkelling — mantas guaranteed*', 'Crystal Bay beach picnic', 'Angel\'s Billabong tidal pools'],
        meals: ['Lunch on the island', 'Dinner at Ubud villa or restaurant'],
        accommodation: 'Return to Ubud villa or Seminyak',
      },
      {
        day: 4,
        title: 'Kintamani Sunrise Breakfast + Hot Springs',
        description: 'Drive to Kintamani for a caldera-view breakfast at sunrise, then volcanic hot springs on Lake Batur.',
        activities: ['5 am depart for Kintamani', 'Sunrise breakfast with caldera panorama', 'Toya Bungkah volcanic hot spring soak', 'Penglipuran traditional village walk', 'Return to villa by noon'],
        meals: ['Sunrise breakfast', 'Romantic dinner at villa'],
        accommodation: 'Alaya Resort Ubud',
      },
      {
        day: 5,
        title: 'Uluwatu Cliff — Kecak at Sunset — Jimbaran Dinner',
        description: 'The most cinematic evening in Bali. Temple at golden hour, fire dance at sunset, grilled seafood on the sand.',
        activities: ['Afternoon at leisure / beach or spa', '3 pm Pura Luhur Uluwatu temple', '5:45 pm Kecak fire dance at the clifftop stage', 'Jimbaran bay — grilled seafood at low tables on the beach'],
        meals: ['Jimbaran beach dinner'],
        accommodation: 'Uluwatu cliff villa or return to Seminyak',
      },
      {
        day: 6,
        title: 'Seminyak Free Day — Spa & Sunset',
        description: 'Your day. Morning yoga, beach, shopping, or another massage. Farewell sunset at Ku De Ta.',
        activities: ['Morning yoga class or beach session (optional)', 'Seminyak spa and shopping', 'Sunset cocktails — Ku De Ta or La Plancha'],
        meals: ['Farewell romantic dinner'],
        accommodation: 'Seminyak private villa',
      },
      {
        day: 7,
        title: 'Tanah Lot Farewell + Airport Transfer',
        description: 'One final temple sunrise, then the drive to Ngurah Rai Airport.',
        activities: ['6 am Tanah Lot sunrise (temple ceremony with local priests)', 'Breakfast at a Tabanan café', 'Airport transfer'],
        meals: ['Breakfast'],
        accommodation: 'Departure',
      },
    ],
    pickupPoints: ['Ngurah Rai International Airport', 'Any Bali hotel / villa'],
    availableSeats: 2,
    totalSeats: 2,
    nextDeparture: '2026-06-14',
    rating: 5.0,
    reviewCount: 161,
    featured: false,
    tags: ['Honeymoon', 'Romance', 'Private Villa', 'All-Inclusive'],
    distance: 'Bali complete circuit',
    routeDescription: 'Ngurah Rai → Seminyak → Ubud → Nusa Penida → Kintamani → Uluwatu → Tanah Lot → Ngurah Rai',
  },
]

// ─── FLEET ────────────────────────────────────────────────────────────────────

export const fleetVehicles: Vehicle[] = [
  { id: 'RTT-001', plateNumber: 'L 8001 RTT', model: 'Toyota HiAce Commuter 2022', capacity: 13, driver: 'Budi Santoso', driverPhone: '+62812-3456-7890', status: 'On Trip', currentRoute: 'Surabaya → Bromo', nextTrip: '2026-05-22', occupancy: 11, totalTrips: 247, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
  { id: 'RTT-002', plateNumber: 'L 8002 RTT', model: 'Toyota HiAce Commuter 2023', capacity: 13, driver: 'Agus Prasetyo', driverPhone: '+62812-3456-7891', status: 'Available', nextTrip: '2026-05-22', occupancy: 0, totalTrips: 201, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
  { id: 'RTT-003', plateNumber: 'L 8003 RTT', model: 'Toyota HiAce Premio 2023', capacity: 11, driver: 'Rizal Firmansyah', driverPhone: '+62812-3456-7892', status: 'Standby', currentRoute: 'Malang Base', nextTrip: '2026-05-21', occupancy: 0, totalTrips: 328, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
  { id: 'RTT-004', plateNumber: 'N 8004 RTT', model: 'Toyota HiAce Commuter 2022', capacity: 13, driver: 'Hendra Wijaya', driverPhone: '+62812-3456-7893', status: 'Fully Booked', currentRoute: 'Malang → Tumpak Sewu', nextTrip: '2026-05-23', occupancy: 13, totalTrips: 292, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
  { id: 'RTT-005', plateNumber: 'L 8005 RTT', model: 'Toyota HiAce Commuter 2021', capacity: 13, driver: 'Wahyu Sulistyo', driverPhone: '+62812-3456-7894', status: 'Maintenance', maintenanceDate: '2026-05-22', occupancy: 0, totalTrips: 461, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
  { id: 'RTT-006', plateNumber: 'DK 8006 RTT', model: 'Toyota HiAce Commuter 2023', capacity: 13, driver: 'Ketut Sujana', driverPhone: '+62812-3456-7895', status: 'On Trip', currentRoute: 'Ubud → Uluwatu', nextTrip: '2026-06-01', occupancy: 9, totalTrips: 169, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
  { id: 'RTT-007', plateNumber: 'DK 8007 RTT', model: 'Toyota HiAce Premio 2022', capacity: 11, driver: 'Wayan Artana', driverPhone: '+62812-3456-7896', status: 'Available', nextTrip: '2026-06-01', occupancy: 0, totalTrips: 214, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
  { id: 'RTT-008', plateNumber: 'L 8008 RTT', model: 'Toyota HiAce Commuter 2023', capacity: 13, driver: 'Doni Kusuma', driverPhone: '+62812-3456-7897', status: 'Available', nextTrip: '2026-05-25', occupancy: 0, totalTrips: 112, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80' },
]

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Haruto Yamamoto',
    country: 'Japan',
    flag: '🇯🇵',
    avatar: 'https://ui-avatars.com/api/?name=Haruto+Y&background=2A2520&color=E8703A&bold=true&size=80&format=png',
    rating: 5,
    review: 'The Ijen blue fire exceeded everything I had seen in photographs. Our guide Budi knew exactly where to position us as the flames emerged from the fissures. What surprised me most was the complete professionalism — from the gas mask fit check to the descent back in darkness. The Toyota HiAce was immaculate and the whole trip felt genuinely premium.',
    package: 'Bromo + Ijen Expedition',
    date: '2026-01-18',
    verified: true,
  },
  {
    id: 't2',
    name: 'Lena Schreiber',
    country: 'Germany',
    flag: '🇩🇪',
    avatar: 'https://ui-avatars.com/api/?name=LS&background=1F2D24&color=3A8A65&bold=true&size=80&format=png',
    rating: 5,
    review: 'My partner and I did the full Surabaya–Bali overland in January. Tumpak Sewu in peak wet season is absolutely surreal — the guide took us behind the main falls and we stood there completely surrounded by water and thunder. Nobody else in our group was from Germany but we immediately became travel friends. Rehan Team coordinated everything seamlessly across 6 days.',
    package: 'East Java to Bali Overland',
    date: '2026-01-29',
    verified: true,
  },
  {
    id: 't3',
    name: 'Ji-Ho Seo',
    country: 'South Korea',
    flag: '🇰🇷',
    avatar: 'https://ui-avatars.com/api/?name=JS&background=1A1F2D&color=2589C8&bold=true&size=80&format=png',
    rating: 5,
    review: '한국어를 조금 할 수 있는 가이드 덕분에 소통이 훨씬 편했어요. Bromo 일출은 정말 인생 사진이었고, 모든 픽업이 정시에 이루어졌습니다. The HiAce seats are actually comfortable — I slept well on the long Bromo-to-Ijen drive. Value for money is outstanding compared to anything I found on Klook.',
    package: 'Bromo + Ijen Expedition',
    date: '2026-02-14',
    verified: true,
  },
  {
    id: 't4',
    name: 'Sophie Reynolds',
    country: 'Australia',
    flag: '🇦🇺',
    avatar: 'https://ui-avatars.com/api/?name=SR&background=2D2020&color=F08457&bold=true&size=80&format=png',
    rating: 5,
    review: 'Booked the Bali Tropical Escape for myself and my two teenage kids. The private HiAce made all the difference — we stopped whenever we wanted, kept the AC at our temperature, and never felt rushed. Nusa Penida with my kids snorkelling with mantas will be a memory for life. Highly recommend for families.',
    package: 'Bali Tropical Escape',
    date: '2026-03-05',
    verified: true,
  },
  {
    id: 't5',
    name: 'Thomas Vandermeer',
    country: 'Netherlands',
    flag: '🇳🇱',
    avatar: 'https://ui-avatars.com/api/?name=TV&background=252020&color=D4A843&bold=true&size=80&format=png',
    rating: 4,
    review: 'Did the Tumpak Sewu Adventure as a solo traveller and ended up with a great group of 9. The canyon descent is genuinely exhilarating — wet, slippery rocks, fixed ropes, and then suddenly you\'re standing inside the waterfall. The guide was safety-conscious without being cautious to the point of being boring. Would do this again.',
    package: 'Tumpak Sewu Waterfall Trek',
    date: '2026-02-22',
    verified: true,
  },
  {
    id: 't6',
    name: 'Yuki Tanaka',
    country: 'Japan',
    flag: '🇯🇵',
    avatar: 'https://ui-avatars.com/api/?name=YT&background=2A1F1F&color=E8703A&bold=true&size=80&format=png',
    rating: 5,
    review: '新婚旅行でバリ島のハネムーンパッケージを利用しました。ヴィラに花びらの装飾があり、夫婦スパもウルワツのサンセットも最高でした。Rehan Tourのスタッフの気配りが素晴らしく、特別な思い出を作ることができました。本当にありがとうございました。',
    package: 'Honeymoon in Bali',
    date: '2026-03-20',
    verified: true,
  },
]

// ─── BLOG POSTS ───────────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: 'ultimate-bromo-sunrise-guide',
    title: 'Mount Bromo Sunrise: The Complete 2026 Guide (Times, Viewpoints & Insider Tips)',
    excerpt: 'Penanjakan at 4 am versus Bukit Cinta at 4:30 am. The exact time sunrise hits the Bromo caldera by month, which jeep routes avoid the crowds, and what to wear when it\'s 5°C and you\'re standing on volcanic ash.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=1200&q=85',
    category: 'East Java Adventure',
    author: 'Rehan Travel Team',
    authorAvatar: 'https://ui-avatars.com/api/?name=Haruto+Y&background=2A2520&color=E8703A&bold=true&size=80&format=png',
    publishedAt: '2026-04-02',
    readTime: '9 min read',
    tags: ['Mount Bromo', 'Sunrise', 'East Java', 'Volcano', 'Guide'],
    featured: true,
  },
  {
    id: 'b2',
    slug: '7-hidden-gems-east-java',
    title: '7 East Java Spots Most Tourists Never Find (And How to Reach Them)',
    excerpt: 'Beyond the Bromo–Ijen circuit, East Java hides an extraordinary second layer. A volcanic sea-cliff waterfall. A forest that looks like Fangorn. An acidic blue lake with no entrance sign. Here are the seven we keep coming back to.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    category: 'Hidden Gems Indonesia',
    author: 'Rehan Travel Team',
    authorAvatar: 'https://ui-avatars.com/api/?name=LS&background=1F2D24&color=3A8A65&bold=true&size=80&format=png',
    publishedAt: '2026-03-18',
    readTime: '13 min read',
    tags: ['Hidden Gems', 'East Java', 'Off-The-Beaten-Path', 'Waterfall', 'Adventure'],
    featured: true,
  },
  {
    id: 'b3',
    slug: 'ijen-blue-fire-guide',
    title: 'Ijen Blue Fire: What It Actually Looks Like (And What Nobody Tells You)',
    excerpt: 'It\'s not a campfire. It\'s not a glow. It\'s liquid sulfur catching light and cascading in electric-blue rivers down the cliff face. Here\'s a frank guide to what the Ijen midnight hike is really like — the cold, the smell, the miners, and the moment.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    category: 'Volcano Adventures',
    author: 'Rehan Travel Team',
    authorAvatar: 'https://ui-avatars.com/api/?name=JS&background=1A1F2D&color=2589C8&bold=true&size=80&format=png',
    publishedAt: '2026-03-04',
    readTime: '11 min read',
    tags: ['Ijen', 'Blue Fire', 'Volcano', 'Night Hike', 'East Java'],
    featured: false,
  },
  {
    id: 'b4',
    slug: 'backpacking-surabaya-to-bali',
    title: 'Surabaya to Bali Overland: Budget Breakdown, Route, and Real Costs in 2026',
    excerpt: 'The Surabaya–Bromo–Ijen–Bali land route is the best-value adventure in Southeast Asia that most travellers skip. Here\'s what it actually costs, how long each section takes, and why doing it by shared HiAce is smarter than piecing it together yourself.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&q=85',
    category: 'Backpacker Tips',
    author: 'Rehan Travel Team',
    authorAvatar: 'https://ui-avatars.com/api/?name=SR&background=2D2020&color=F08457&bold=true&size=80&format=png',
    publishedAt: '2026-02-16',
    readTime: '16 min read',
    tags: ['Backpacking', 'Budget Travel', 'Surabaya', 'Bali', 'Overland'],
    featured: true,
  },
  {
    id: 'b5',
    slug: 'best-time-to-visit-bali',
    title: 'Best Time to Visit Bali in 2026: Month-by-Month Breakdown for Different Trips',
    excerpt: 'Dry season is not always the right answer. Surfing, rice terrace photography, temple ceremonies, and Nyepi each have their own optimal months. We break down every month of the year for different types of Bali travel.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
    category: 'Bali Travel Guide',
    author: 'Rehan Travel Team',
    authorAvatar: 'https://ui-avatars.com/api/?name=YT&background=2A1F1F&color=E8703A&bold=true&size=80&format=png',
    publishedAt: '2026-01-28',
    readTime: '10 min read',
    tags: ['Bali', 'Weather', 'Travel Planning', 'Seasons', 'When To Go'],
    featured: false,
  },
  {
    id: 'b6',
    slug: 'explore-indonesia-like-local',
    title: 'How to Travel Indonesia Like a Local: 11 Things Guides Never Tell Their Groups',
    excerpt: 'After years of guiding international travellers across Java and Bali, here are the 11 things we notice that separate the tourists from the travellers — from when to eat to how to negotiate at markets to which temples require barefoot silence.',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
    category: 'Cultural Experiences',
    author: 'Rehan Travel Team',
    authorAvatar: 'https://ui-avatars.com/api/?name=TV&background=252020&color=D4A843&bold=true&size=80&format=png',
    publishedAt: '2026-01-12',
    readTime: '12 min read',
    tags: ['Local Tips', 'Culture', 'Indonesia', 'Etiquette', 'Insider'],
    featured: false,
  },
]

// ─── PICKUP POINTS ────────────────────────────────────────────────────────────

export const pickupPoints: PickupPoint[] = [
  // SURABAYA
  { id: 'sub-juanda-t1', city: 'Surabaya', region: 'surabaya', name: 'Juanda Airport — Terminal 1', address: 'Terminal 1 Arrivals Hall, Bandar Udara Internasional Juanda', additionalFee: 0, meetingTime: 'As per flight arrival (WhatsApp us your flight number)', landmark: 'Domestic arrivals exit — look for Rehan Tour board', coordinates: { lat: -7.3797, lng: 112.7868 } },
  { id: 'sub-juanda-t2', city: 'Surabaya', region: 'surabaya', name: 'Juanda Airport — Terminal 2', address: 'Terminal 2 Arrivals Hall, Bandar Udara Internasional Juanda', additionalFee: 0, meetingTime: 'As per flight arrival', landmark: 'International arrivals exit — name board', coordinates: { lat: -7.3820, lng: 112.7890 } },
  { id: 'sub-gubeng', city: 'Surabaya', region: 'surabaya', name: 'Gubeng Train Station', address: 'Jl. Stasiun Gubeng No. 1, Surabaya', additionalFee: 0, meetingTime: '30 min after train arrival', landmark: 'Main station entrance, east side', coordinates: { lat: -7.2650, lng: 112.7441 } },
  { id: 'sub-pasar-turi', city: 'Surabaya', region: 'surabaya', name: 'Pasar Turi Station', address: 'Jl. Semarang, Pasar Turi, Surabaya', additionalFee: 0, meetingTime: 'Fixed departure time', landmark: 'Station main gate — north entrance', coordinates: { lat: -7.2433, lng: 112.7283 } },
  { id: 'sub-tunjungan', city: 'Surabaya', region: 'surabaya', name: 'Tunjungan Plaza Area', address: 'Tunjungan Plaza Mall, Jl. Basuki Rahmat 7–9, Surabaya', additionalFee: 25000, meetingTime: 'Fixed departure time', landmark: 'TP entrance parking island, drop-off bay', coordinates: { lat: -7.2651, lng: 112.7384 } },
  { id: 'sub-hotel', city: 'Surabaya', region: 'surabaya', name: 'Surabaya Hotel Pickup (Custom)', address: 'Any Surabaya hotel — please provide address at booking', additionalFee: 50000, meetingTime: 'Agreed departure time', landmark: 'Hotel lobby', coordinates: { lat: -7.2575, lng: 112.7521 } },
  // MALANG
  { id: 'mlg-airport', city: 'Malang', region: 'malang', name: 'Abdul Rachman Saleh Airport', address: 'Jl. Mondoroko No. 28, Singosari, Malang', additionalFee: 0, meetingTime: 'As per flight arrival', landmark: 'Arrivals hall exit', coordinates: { lat: -7.9263, lng: 112.7145 } },
  { id: 'mlg-station', city: 'Malang', region: 'malang', name: 'Malang Kota Baru Station', address: 'Jl. Kertanegara No. 1, Klojen, Malang', additionalFee: 0, meetingTime: '30 min after train arrival', landmark: 'Station main gate on Jl. Kertanegara', coordinates: { lat: -7.9772, lng: 112.6311 } },
  { id: 'mlg-arjosari', city: 'Malang', region: 'malang', name: 'Arjosari Bus Terminal', address: 'Jl. Raden Intan, Blimbing, Malang', additionalFee: 0, meetingTime: 'Fixed time', landmark: 'Terminal main entrance', coordinates: { lat: -7.9433, lng: 112.6619 } },
  { id: 'mlg-alun', city: 'Malang', region: 'malang', name: 'Alun-Alun Malang', address: 'Jl. Merdeka, Klojen, Malang City Centre', additionalFee: 15000, meetingTime: 'Fixed time', landmark: 'Fountain at the main town square', coordinates: { lat: -7.9819, lng: 112.6315 } },
  { id: 'mlg-brawijaya', city: 'Malang', region: 'malang', name: 'Universitas Brawijaya Gate', address: 'Jl. Veteran, Lowokwaru, Malang', additionalFee: 15000, meetingTime: 'Fixed time', landmark: 'Main university gate on Jl. Veteran', coordinates: { lat: -7.9528, lng: 112.6125 } },
  { id: 'mlg-hotel', city: 'Malang', region: 'malang', name: 'Malang Hotel Pickup (Custom)', address: 'Any Malang hotel — provide address at booking', additionalFee: 25000, meetingTime: 'Agreed departure time', landmark: 'Hotel lobby', coordinates: { lat: -7.9666, lng: 112.6326 } },
  // BANYUWANGI
  { id: 'bwi-harbor', city: 'Banyuwangi', region: 'banyuwangi', name: 'Ketapang Ferry Terminal', address: 'Pelabuhan Penyeberangan Ketapang, Banyuwangi', additionalFee: 0, meetingTime: 'Before scheduled ferry departure', landmark: 'Terminal passenger gate', coordinates: { lat: -8.1697, lng: 114.3742 } },
  { id: 'bwi-airport', city: 'Banyuwangi', region: 'banyuwangi', name: 'Blimbingsari Airport', address: 'Jl. Raya Blimbingsari, Banyuwangi', additionalFee: 0, meetingTime: 'As per flight arrival', landmark: 'Arrivals exit', coordinates: { lat: -8.3152, lng: 114.3393 } },
  { id: 'bwi-ijen', city: 'Banyuwangi', region: 'banyuwangi', name: 'Ijen Basecamp (Paltuding)', address: 'Paltuding, Kawah Ijen basecamp parking area', additionalFee: 0, meetingTime: '11:30 pm sharp (midnight hike departure)', landmark: 'Basecamp registration desk', coordinates: { lat: -8.0584, lng: 114.2422 } },
  // BALI
  { id: 'bali-ngurah', city: 'Bali', region: 'bali', name: 'Ngurah Rai International Airport', address: 'Bandar Udara Internasional I Gusti Ngurah Rai, Tuban, Kuta', additionalFee: 0, meetingTime: 'As per flight arrival', landmark: 'International / domestic arrivals — name board', coordinates: { lat: -8.7467, lng: 115.1670 } },
  { id: 'bali-kuta', city: 'Bali', region: 'bali', name: 'Kuta Area', address: 'Kuta, Badung, Bali', additionalFee: 20000, meetingTime: 'Fixed departure time', landmark: 'Hotel lobby (address provided at booking)', coordinates: { lat: -8.7210, lng: 115.1680 } },
  { id: 'bali-seminyak', city: 'Bali', region: 'bali', name: 'Seminyak Area', address: 'Seminyak, Badung, Bali', additionalFee: 30000, meetingTime: 'Fixed departure time', landmark: 'Hotel / villa lobby', coordinates: { lat: -8.6910, lng: 115.1602 } },
  { id: 'bali-ubud', city: 'Bali', region: 'bali', name: 'Ubud Area', address: 'Ubud, Gianyar, Bali', additionalFee: 70000, meetingTime: 'Fixed departure time', landmark: 'Hotel / villa lobby', coordinates: { lat: -8.5069, lng: 115.2625 } },
  { id: 'bali-canggu', city: 'Bali', region: 'bali', name: 'Canggu / Berawa Area', address: 'Canggu, Badung, Bali', additionalFee: 30000, meetingTime: 'Fixed departure time', landmark: 'Villa / hotel lobby', coordinates: { lat: -8.6575, lng: 115.1313 } },
  { id: 'bali-nusa-dua', city: 'Bali', region: 'bali', name: 'Nusa Dua / Benoa Area', address: 'Nusa Dua, BTDC, Badung, Bali', additionalFee: 50000, meetingTime: 'Fixed departure time', landmark: 'Resort lobby entrance gate', coordinates: { lat: -8.7996, lng: 115.2305 } },
]

// ─── ROUTE DATA ────────────────────────────────────────────────────────────────

export const routeStops = [
  { id: 'surabaya', name: 'Surabaya', type: 'city', coords: { x: 12, y: 58 }, description: 'Main departure hub — Juanda Airport, Gubeng Station' },
  { id: 'malang', name: 'Malang', type: 'city', coords: { x: 20, y: 72 }, description: 'Cool highland city — colonial streets & kampung warna-warni' },
  { id: 'tumpak-sewu', name: 'Tumpak Sewu', type: 'waterfall', coords: { x: 28, y: 80 }, description: 'Java\'s most spectacular curtain waterfall' },
  { id: 'bromo', name: 'Mt. Bromo', type: 'volcano', coords: { x: 34, y: 58 }, description: '2,329 m — iconic volcanic caldera sunrise' },
  { id: 'banyuwangi', name: 'Banyuwangi', type: 'city', coords: { x: 74, y: 68 }, description: 'Gateway city — Ijen access and Bali ferry' },
  { id: 'ijen', name: 'Ijen Crater', type: 'volcano', coords: { x: 76, y: 52 }, description: '2,799 m — blue fire and turquoise crater lake' },
  { id: 'ferry', name: 'Ferry Crossing', type: 'ferry', coords: { x: 84, y: 64 }, description: 'Ketapang → Gilimanuk — 30 min across the Bali Strait' },
  { id: 'bali', name: 'Bali', type: 'island', coords: { x: 92, y: 60 }, description: 'Paradise island — Ubud, Uluwatu, Nusa Penida & more' },
]

export const departureSchedule = [
  { date: '2026-05-21', package: 'Bromo Sunrise Classic', seats: 7, status: 'Open' },
  { date: '2026-05-23', package: 'Tumpak Sewu Waterfall Trek', seats: 8, status: 'Open' },
  { date: '2026-05-25', package: 'Bromo + Ijen Expedition', seats: 4, status: 'Limited' },
  { date: '2026-05-28', package: 'East Java to Bali Overland', seats: 5, status: 'Limited' },
  { date: '2026-06-01', package: 'Bali Tropical Escape', seats: 6, status: 'Open' },
  { date: '2026-06-07', package: 'Luxury East Java Escape', seats: 2, status: 'Limited' },
]

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
]
