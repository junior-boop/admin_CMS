export function createCacheClient(kv) {
    return {
        async get(key) {
            const raw = await kv.get(key, 'text');
            if (raw === null)
                return null;
            try {
                return JSON.parse(raw);
            }
            catch {
                return null;
            }
        },
        async set(key, value, ttlSeconds) {
            const options = ttlSeconds ? { expirationTtl: ttlSeconds } : undefined;
            await kv.put(key, JSON.stringify(value), options);
        },
        async invalidate(key) {
            await kv.delete(key);
        },
        async invalidatePattern(prefix) {
            const list = await kv.list({ prefix });
            await Promise.all(list.keys.map((k) => kv.delete(k.name)));
        },
    };
}
//# sourceMappingURL=cache.js.map