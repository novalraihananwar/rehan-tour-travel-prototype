import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function slugify(name: string): string {
  return name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ destinations: data || [] })
  } catch (e) {
    console.error('[destinations GET]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { name, region, tagline, description, long_description, image, hero_image,
      category, difficulty, duration, best_season, highlights, hidden_gems, local_food,
      featured, is_active } = body
    if (!name || !region) return NextResponse.json({ error: 'name dan region wajib' }, { status: 400 })
    const slug = slugify(name)
    const { data, error } = await supabase.from('destinations').insert({
      slug, name, region,
      tagline: tagline || null,
      description: description || null,
      long_description: long_description || null,
      image: image || null,
      hero_image: hero_image || null,
      category: category || null,
      difficulty: difficulty || null,
      duration: duration || null,
      best_season: best_season || null,
      highlights: highlights || [],
      hidden_gems: hidden_gems || [],
      local_food: local_food || [],
      featured: featured ?? false,
      is_active: is_active ?? true,
    }).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ destination: data })
  } catch (e) {
    console.error('[destinations POST]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 })
    if (typeof fields.name === 'string' && fields.name) fields.slug = slugify(fields.name)
    const { error } = await supabase.from('destinations').update(fields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[destinations PATCH]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 })
    const { error } = await supabase.from('destinations').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[destinations DELETE]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
