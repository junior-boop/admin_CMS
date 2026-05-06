import { env as _cfEnv } from 'cloudflare:workers'

export const GET = async ({ params, request }: { params: { key: string }; request: Request }) => {
  const env = _cfEnv as Record<string, unknown>
  const bucket = env['BUCKET'] as R2Bucket | undefined

  if (!bucket) {
    return new Response('R2 bucket not configured', { status: 500 })
  }

  const key = params.key
  const file = await bucket.get(key)

  if (!file) {
    return new Response('File not found', { status: 404 })
  }

  return new Response(file.body, {
    headers: {
      'Content-Type': file.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}