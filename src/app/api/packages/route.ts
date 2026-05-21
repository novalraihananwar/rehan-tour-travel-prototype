import { NextRequest, NextResponse } from 'next/server'
import { supabase, getSupabaseAdmin } from '@/lib/supabase'
import { tourPackages } from '@/lib/data'

// GET — merge Supabase packages (overrides) with hardcoded
export async function GET(req: NextRequest) {
  const adminOnly = req.nextUrl.searchParams.get('admin') === '1'

  try {
    const { data: dbPkgs } = await supabase
      .from('tour_packages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!dbPkgs || dbPkgs.length === 0) {
      // Return hardcoded packages with is_active=true
      return NextResponse.json(tourPackages.map(p => ({ ...p, is_active: true, source: 'hardcoded' })))
    }

    // Merge: DB packages take priority over hardcoded
    const dbSlugs = new Set(dbPkgs.map(p => p.slug))
    const hardcoded = tourPackages
      .filter(p => !dbSlugs.has(p.slug))
      .map(p => ({ ...p, is_active: true, source: 'hardcoded' }))

    const merged = [
      ...dbPkgs.map(p => ({ ...p, source: 'supabase' })),
      ...hardcoded,
    ]

    // For public endpoint, filter only active packages
    if (!adminOnly) {
      return NextResponse.json(merged.filter(p => p.is_active !== false))
    }

    return NextResponse.json(merged)
  } catch {
    return NextResponse.json(tourPackages.map(p => ({ ...p, is_active: true, source: 'hardcoded' })))
  }
}

// POST — create new package
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()

    // BUG-6: cek duplikasi slug sebelum insert
    const { data: existing } = await supabase
      .from('tour_packages')
      .select('slug')
      .eq('slug', body.slug)
      .single()
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })

    const { data, error } = await supabase
      .from('tour_packages')
      .insert({
        id:              body.id || `pkg-${Date.now()}`,
        slug:            body.slug,
        title:           body.title,
        subtitle:        body.subtitle || '',
        cover_image:     body.coverImage || '',
        type:            body.type || 'shared',
        duration:        body.duration || '',
        duration_days:   body.durationDays || 1,
        max_group_size:  body.maxGroupSize || 13,
        price_usd:       body.priceUsd || 0,
        price_idr:       body.priceIdr || 0,
        original_price_usd: body.originalPriceUsd || null,
        rating:          body.rating || 4.9,
        review_count:    body.reviewCount || 0,
        available_seats: body.availableSeats || 13,
        total_seats:     body.totalSeats || 13,
        next_departure:  body.nextDeparture || null,
        route_description: body.routeDescription || '',
        tags:            JSON.stringify(body.tags || []),
        highlights:      JSON.stringify(body.highlights || []),
        included:        JSON.stringify(body.included || []),
        excluded:        JSON.stringify(body.excluded || []),
        itinerary:       JSON.stringify(body.itinerary || []),
        is_active:       body.isActive !== false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH — update package
export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { slug, ...updates } = body

    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    // Map camelCase to snake_case
    const dbUpdates: Record<string, unknown> = {}
    if ('title'           in updates) dbUpdates.title           = updates.title
    if ('subtitle'        in updates) dbUpdates.subtitle        = updates.subtitle
    if ('priceUsd'        in updates) dbUpdates.price_usd       = updates.priceUsd
    if ('priceIdr'        in updates) dbUpdates.price_idr       = updates.priceIdr
    if ('isActive'        in updates) dbUpdates.is_active       = updates.isActive
    if ('coverImage'      in updates) dbUpdates.cover_image     = updates.coverImage
    if ('type'            in updates) dbUpdates.type            = updates.type
    if ('duration'        in updates) dbUpdates.duration        = updates.duration
    if ('durationDays'    in updates) dbUpdates.duration_days   = updates.durationDays
    if ('maxGroupSize'    in updates) dbUpdates.max_group_size  = updates.maxGroupSize
    if ('availableSeats'  in updates) dbUpdates.available_seats = updates.availableSeats
    if ('routeDescription'in updates) dbUpdates.route_description = updates.routeDescription
    if ('highlights'      in updates) dbUpdates.highlights      = JSON.stringify(updates.highlights)
    if ('included'        in updates) dbUpdates.included        = JSON.stringify(updates.included)
    if ('excluded'        in updates) dbUpdates.excluded        = JSON.stringify(updates.excluded)
    if ('tags'            in updates) dbUpdates.tags            = JSON.stringify(updates.tags)
    dbUpdates.updated_at = new Date().toISOString()

    // Upsert — insert if not exists, update if exists
    const { data: existing } = await supabase.from('tour_packages').select('slug').eq('slug', slug).single()

    if (!existing) {
      // Package is hardcoded — create a Supabase override record
      const hardcoded = tourPackages.find(p => p.slug === slug)
      if (!hardcoded) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

      await supabase.from('tour_packages').insert({
        id: `pkg-${slug}`,
        slug,
        title:           hardcoded.title,
        subtitle:        hardcoded.subtitle,
        cover_image:     hardcoded.coverImage,
        type:            hardcoded.type,
        duration:        hardcoded.duration,
        duration_days:   hardcoded.durationDays,
        max_group_size:  hardcoded.maxGroupSize,
        price_usd:       hardcoded.price.usd,
        price_idr:       hardcoded.price.idr,
        rating:          hardcoded.rating,
        review_count:    hardcoded.reviewCount,
        available_seats: hardcoded.availableSeats,
        total_seats:     hardcoded.totalSeats,
        route_description: hardcoded.routeDescription,
        tags:            JSON.stringify(hardcoded.tags),
        highlights:      JSON.stringify(hardcoded.highlights),
        included:        JSON.stringify(hardcoded.included),
        excluded:        JSON.stringify(hardcoded.excluded),
        itinerary:       JSON.stringify(hardcoded.itinerary),
        is_active:       true,
        ...dbUpdates,
      })
    } else {
      await supabase.from('tour_packages').update(dbUpdates).eq('slug', slug)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
