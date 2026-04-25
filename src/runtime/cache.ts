export interface CacheClient {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>
  invalidate(key: string): Promise<void>
  invalidatePattern(prefix: string): Promise<void>
}

export function createCacheClient(kv: KVNamespace): CacheClient {
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      const raw = await kv.get(key, 'text')
      if (raw === null) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },

    async set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
      const options = ttlSeconds ? { expirationTtl: ttlSeconds } : undefined
      await kv.put(key, JSON.stringify(value), options)
    },

    async invalidate(key: string): Promise<void> {
      await kv.delete(key)
    },

    async invalidatePattern(prefix: string): Promise<void> {
      const list = await kv.list({ prefix })
      await Promise.all(list.keys.map((k) => kv.delete(k.name)))
    },
  }
}
