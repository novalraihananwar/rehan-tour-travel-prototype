import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function slugify(title: string): string {
  return title.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data || [] })
  } catch (e) {
    console.error('[blog GET]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { title, excerpt, content, cover_image, author, author_avatar,
      category, tags, read_time, is_published } = body
    if (!title) return NextResponse.json({ error: 'title wajib' }, { status: 400 })
    const slug = slugify(title)
    const { data, error } = await supabase.from('blog_posts').insert({
      slug, title,
      excerpt: excerpt || null,
      content: content || null,
      cover_image: cover_image || null,
      author: author || 'Rehan Team',
      author_avatar: author_avatar || null,
      category: category || null,
      tags: tags || [],
      read_time: read_time || '5 min read',
      is_published: is_published ?? false,
      published_at: is_published ? new Date().toISOString() : null,
    }).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (e) {
    console.error('[blog POST]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 })
    if (typeof fields.title === 'string' && fields.title) fields.slug = slugify(fields.title)
    if (fields.is_published && !fields.published_at) fields.published_at = new Date().toISOString()
    const { error } = await supabase.from('blog_posts').update(fields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[blog PATCH]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 })
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[blog DELETE]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
