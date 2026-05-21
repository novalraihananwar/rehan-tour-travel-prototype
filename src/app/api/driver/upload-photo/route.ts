/*
 * Supabase Storage: buat 2 bucket di Storage Dashboard
 * 1. 'driver-photos'    → Public bucket (untuk foto driver yang terlihat customer)
 * 2. 'driver-documents' → Private bucket (untuk KTP, admin only)
 *
 * Supabase SQL Editor:
 * ALTER TABLE drivers ADD COLUMN IF NOT EXISTS photo_url text;
 * ALTER TABLE drivers ADD COLUMN IF NOT EXISTS ktp_photo_url text;
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

type Bucket = 'driver-photos' | 'driver-documents'

function isValidBucket(value: string): value is Bucket {
  return value === 'driver-photos' || value === 'driver-documents'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const file = formData.get('file') as File | null
    const bucketRaw = formData.get('bucket') as string | null
    const filename = formData.get('filename') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File wajib disertakan.' }, { status: 400 })
    }
    if (!bucketRaw || !isValidBucket(bucketRaw)) {
      return NextResponse.json({ error: 'Bucket tidak valid. Gunakan driver-photos atau driver-documents.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB.' }, { status: 400 })
    }

    const originalName = filename || file.name || 'upload'
    const filePath = `${Date.now()}-${originalName}`

    const admin = getSupabaseAdmin()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await admin.storage
      .from(bucketRaw)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload-photo] upload error:', uploadError)
      return NextResponse.json({ error: 'Gagal mengupload file. Coba lagi.' }, { status: 500 })
    }

    if (bucketRaw === 'driver-photos') {
      const { data: urlData } = admin.storage.from('driver-photos').getPublicUrl(filePath)
      return NextResponse.json({ ok: true, url: urlData.publicUrl })
    }

    // driver-documents: private bucket, return storage path only
    return NextResponse.json({ ok: true, url: `driver-documents/${filePath}` })
  } catch (err) {
    console.error('[upload-photo]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
