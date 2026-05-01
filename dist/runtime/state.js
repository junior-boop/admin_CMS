export class StateManager {
    cache;
    defaultTTL;
    memoryCache = new Map();
    listeners = new Map();
    constructor(options) {
        this.cache = options.cache;
        this.defaultTTL = options.defaultTTL ?? 300;
    }
    getMemoryCache(key) {
        const entry = this.memoryCache.get(key);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > entry.ttl * 1000) {
            this.memoryCache.delete(key);
            return null;
        }
        return entry.data;
    }
    setMemoryCache(key, data, ttl) {
        this.memoryCache.set(key, { data, timestamp: Date.now(), ttl });
    }
    async getOrFetch(key, fetcher, options = {}) {
        const { useCache = true, ttlSeconds = this.defaultTTL } = options;
        if (useCache) {
            const memCached = this.getMemoryCache(key);
            if (memCached !== null)
                return memCached;
            const kvCached = await this.cache.get(key);
            if (kvCached !== null) {
                this.setMemoryCache(key, kvCached, ttlSeconds);
                return kvCached;
            }
        }
        const data = await fetcher();
        if (useCache) {
            this.setMemoryCache(key, data, ttlSeconds);
            await this.cache.set(key, data, ttlSeconds);
        }
        return data;
    }
    async invalidate(key) {
        this.memoryCache.delete(key);
        await this.cache.invalidate(key);
        this.emit(key, null);
    }
    async invalidatePattern(prefix) {
        for (const key of this.memoryCache.keys()) {
            if (key.startsWith(prefix))
                this.memoryCache.delete(key);
        }
        await this.cache.invalidatePattern(prefix);
    }
    async set(key, data, ttlSeconds) {
        const ttl = ttlSeconds ?? this.defaultTTL;
        this.setMemoryCache(key, data, ttl);
        await this.cache.set(key, data, ttl);
        this.emit(key, data);
    }
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        return () => this.listeners.get(key)?.delete(callback);
    }
    emit(key, data) {
        this.listeners.get(key)?.forEach(cb => cb(data));
    }
    getCacheKey(collection, id) {
        return id ? `cms:${collection}:${id}` : `cms:${collection}:list`;
    }
    async invalidateCollection(collection) {
        await this.invalidatePattern(`cms:${collection}:`);
    }
}
export function createStateManager(cache, defaultTTL) {
    return new StateManager({ cache, defaultTTL });
}
//# sourceMappingURL=state.js.map