import type { APIRoute } from 'astro'
import { env as _cfEnv } from 'cloudflare:workers'
import { createCachedSystemClient } from '../../system/index.js'
import { createMediaClient } from '../../runtime/media.js'

export const GET: APIRoute = async () => {
  const env = _cfEnv as Record<string, unknown>
  const db = env['DB'] as D1Database
  const kv = env['CACHE'] as KVNamespace | undefined
  const system = createCachedSystemClient(db, kv)

  const list = await system.mediaDb.list()
  return new Response(JSON.stringify(list), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  const env = _cfEnv as Record<string, unknown>
  const db = env['DB'] as D1Database
  const kv = env['CACHE'] as KVNamespace | undefined
  const bucket = env['BUCKET'] as R2Bucket | undefined
  const system = createCachedSystemClient(db, kv)

  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Storage non configuré' }), { status: 500 })
  }

  const form = await request.formData()
  const file = form.get('file') as File | null

  if (!file || file.size === 0) {
    return new Response(JSON.stringify({ error: 'Aucun fichier' }), { status: 400 })
  }

  const mediaClient = createMediaClient(bucket, '/media')
  const uploaded = await mediaClient.upload(await file.arrayBuffer(), {
    key: `uploads/${Date.now()}-${file.name}`,
    contentType: file.type,
  })

  await system.mediaDb.create({
    key: uploaded.key,
    filename: file.name,
    contentType: file.type,
    size: uploaded.size,
    url: uploaded.url,
    alt: null,
  })

  return new Response(JSON.stringify({ url: uploaded.url, filename: file.name }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
