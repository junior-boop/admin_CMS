import type { CacheClient } from './cache.js'

export interface CacheOptions {
  ttlSeconds?: number
  useCache?: boolean
}

export interface StateManagerOptions {
  cache: CacheClient
  defaultTTL?: number
}

export interface InvalidationStrategy {
  invalidateOnCreate?: string[]
  invalidateOnUpdate?: string[]
  invalidateOnDelete?: string[]
}

type CacheGetter<T> = () => Promise<T>
type CacheSetter<T> = (value: T) => Promise<void>

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class StateManager {
  private cache: CacheClient
  private defaultTTL: number
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map()
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  constructor(options: StateManagerOptions) {
    this.cache = options.cache
    this.defaultTTL = options.defaultTTL ?? 300
  }

  private getMemoryCache<T>(key: string): T | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key)
      return null
    }
    return entry.data
  }

  private setMemoryCache<T>(key: string, data: T, ttl: number): void {
    this.memoryCache.set(key, { data, timestamp: Date.now(), ttl })
  }

  async getOrFetch<T>(
    key: string,
    fetcher: CacheGetter<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { useCache = true, ttlSeconds = this.defaultTTL } = options

    if (useCache) {
      const memCached = this.getMemoryCache<T>(key)
      if (memCached !== null) return memCached

      const kvCached = await this.cache.get<T>(key)
      if (kvCached !== null) {
        this.setMemoryCache(key, kvCached, ttlSeconds)
        return kvCached
      }
    }

    const data = await fetcher()
    if (useCache) {
      this.setMemoryCache(key, data, ttlSeconds)
      await this.cache.set(key, data, ttlSeconds)
    }
    return data
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key)
    await this.cache.invalidate(key)
    this.emit(key, null)
  }

  async invalidatePattern(prefix: string): Promise<void> {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) this.memoryCache.delete(key)
    }
    await this.cache.invalidatePattern(prefix)
  }

  async set<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTTL
    this.setMemoryCache(key, data, ttl)
    await this.cache.set(key, data, ttl)
    this.emit(key, data)
  }

  subscribe(key: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(callback)
    return () => this.listeners.get(key)?.delete(callback)
  }

  private emit(key: string, data: unknown): void {
    this.listeners.get(key)?.forEach(cb => cb(data))
  }

  getCacheKey(collection: string, id?: string): string {
    return id ? `cms:${collection}:${id}` : `cms:${collection}:list`
  }

  async invalidateCollection(collection: string): Promise<void> {
    await this.invalidatePattern(`cms:${collection}:`)
  }
}

export function createStateManager(cache: CacheClient, defaultTTL?: number): StateManager {
  return new StateManager({ cache, defaultTTL })
}