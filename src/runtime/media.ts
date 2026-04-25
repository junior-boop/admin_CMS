export interface UploadOptions {
  key?: string
  contentType?: string
  metadata?: Record<string, string>
}

export interface MediaObject {
  key: string
  url: string
  size: number
  contentType: string
  uploadedAt: string
}

export interface MediaClient {
  upload(file: ReadableStream | ArrayBuffer | Blob, options?: UploadOptions): Promise<MediaObject>
  getUrl(key: string): string
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<Pick<MediaObject, 'key' | 'size' | 'uploadedAt'>[]>
}

export function createMediaClient(bucket: R2Bucket, publicUrlBase: string): MediaClient {
  function generateKey(contentType?: string): string {
    const ext = contentType?.split('/')[1] ?? 'bin'
    return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  }

  async function toArrayBuffer(input: ReadableStream | ArrayBuffer | Blob): Promise<ArrayBuffer> {
    if (input instanceof ArrayBuffer) return input
    if (input instanceof Blob) return input.arrayBuffer()
    const reader = input.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    const total = chunks.reduce((n, c) => n + c.byteLength, 0)
    const buf = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      buf.set(chunk, offset)
      offset += chunk.byteLength
    }
    return buf.buffer
  }

  return {
    async upload(file, options = {}) {
      const buf = await toArrayBuffer(file)
      const key = options.key ?? generateKey(options.contentType)
      const putOptions: R2PutOptions = {
        httpMetadata: { contentType: options.contentType ?? 'application/octet-stream' },
      }
      if (options.metadata) putOptions.customMetadata = options.metadata
      await bucket.put(key, buf, putOptions)
      return {
        key,
        url: `${publicUrlBase}/${key}`,
        size: buf.byteLength,
        contentType: options.contentType ?? 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      }
    },

    getUrl(key: string) {
      return `${publicUrlBase}/${key}`
    },

    async delete(key: string) {
      await bucket.delete(key)
    },

    async list(prefix?: string) {
      const listOptions: R2ListOptions = {}
      if (prefix) listOptions.prefix = prefix
      const result = await bucket.list(listOptions)
      return result.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploadedAt: obj.uploaded.toISOString(),
      }))
    },
  }
}
